import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BoardState, Player, Position, Move, GameStatus, PieceType, API_KEY_ERROR_MESSAGE, GameHistoryEntry, LoggedGame, AnimatingPieceDetails, DisappearingPieceInfo } from './types.ts';
import { initializeBoard, getValidMoves, applyMove, checkGameStatus, hashBoard, createEmptySquareState } from './services/checkersLogic';
import { getAIMove, isGeminiAvailable } from './services/geminiService';
import { positionToNotation, getGameResultString } from './services/notationLogic';
import Board from './components/Board';
import GameStatusDisplay from './components/GameStatusDisplay';
import SetupScreen, { DifficultyLevel } from './components/SetupScreen'; // Import DifficultyLevel
import RulesScreen from './components/RulesScreen';
import AboutScreen from './components/AboutScreen'; 
import LogoText from './components/LogoText';
import GameLogListScreen from './components/GameLogListScreen';
import GameLogViewScreen from './components/GameLogViewScreen';
import ThemeToggleButton from './components/ThemeToggleButton'; // Added for use in App's JSX
import { ANIMATION_DURATION_MS, CAPTURE_ANIMATION_DURATION_MS } from './constants.ts';

const APP_VERSION = "1.0.1"; // Incremented version for new features

const App: React.FC = () => {
  const [gameScreen, setGameScreen] = useState<'setup' | 'game' | 'rules' | 'about' | 'gameLogList' | 'gameLogView'>('setup'); 
  
  const [boardState, setBoardState] = useState<BoardState>(initializeBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>(Player.USER); 
  
  const [humanPlayerId, setHumanPlayerId] = useState<Player>(Player.USER); 
  const [aiPlayerId, setAiPlayerId] = useState<Player>(Player.AI); 
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('standard'); 

  const [selectedPiecePos, setSelectedPiecePos] = useState<Position | null>(null);
  const [validMovesForSelected, setValidMovesForSelected] = useState<Move[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.PLAYING);
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [midJumpPiecePos, setMidJumpPiecePos] = useState<Position | null>(null);
  const [geminiReady, setGeminiReady] = useState<boolean>(false);
  const [showApiKeyError, setShowApiKeyError] = useState<boolean>(false);
  
  // Animation states
  const [animatingPieceDetails, setAnimatingPieceDetails] = useState<AnimatingPieceDetails | null>(null);
  const [disappearingJumpedPieceInfo, setDisappearingJumpedPieceInfo] = useState<DisappearingPieceInfo | null>(null);


  const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([]);
  const [kingDominanceInfo, setKingDominanceInfo] = useState<{ player: Player | null, moves: number }>({ player: null, moves: 0 });
  const [stagnationMoveCount, setStagnationMoveCount] = useState<number>(0); 
  const [kingEndgameNoProgressMoves, setKingEndgameNoProgressMoves] = useState<number>(0);

  const [aiThinkingTime, setAiThinkingTime] = useState<number>(0); 
  const aiTimerRef = useRef<number | null>(null);

  const [gameLogs, setGameLogs] = useState<LoggedGame[]>([]);
  const [activeGameMoves, setActiveGameMoves] = useState<string[]>([]);
  const [currentMoveNumber, setCurrentMoveNumber] = useState<number>(1);
  const [currentPlyWhitePart, setCurrentPlyWhitePart] = useState<string | null>(null);
  const [currentPlyRawNotation, setCurrentPlyRawNotation] = useState<string[]>([]);
  const [isNewPieceAction, setIsNewPieceAction] = useState<boolean>(true);
  const [selectedLogForView, setSelectedLogForView] = useState<LoggedGame | null>(null);

  // Refs for state used in timeouts
  const isNewPieceActionRef = useRef(isNewPieceAction);
  const currentPlyRawNotationRef = useRef(currentPlyRawNotation);
  const currentMoveNumberRef = useRef(currentMoveNumber);
  const currentPlyWhitePartRef = useRef(currentPlyWhitePart);
  const activeGameMovesRef = useRef(activeGameMoves);
  const gameLogsRef = useRef(gameLogs);
  const humanPlayerIdRef = useRef(humanPlayerId);
  const aiPlayerIdRef = useRef(aiPlayerId); 
  const difficultyRef = useRef(difficulty);
  const boardStateRef = useRef(boardState); 


  useEffect(() => { isNewPieceActionRef.current = isNewPieceAction; }, [isNewPieceAction]);
  useEffect(() => { currentPlyRawNotationRef.current = currentPlyRawNotation; }, [currentPlyRawNotation]);
  useEffect(() => { currentMoveNumberRef.current = currentMoveNumber; }, [currentMoveNumber]);
  useEffect(() => { currentPlyWhitePartRef.current = currentPlyWhitePart; }, [currentPlyWhitePart]);
  useEffect(() => { activeGameMovesRef.current = activeGameMoves; }, [activeGameMoves]);
  useEffect(() => { gameLogsRef.current = gameLogs; }, [gameLogs]);
  useEffect(() => { humanPlayerIdRef.current = humanPlayerId; }, [humanPlayerId]);
  useEffect(() => { aiPlayerIdRef.current = aiPlayerId; }, [aiPlayerId]);
  useEffect(() => { difficultyRef.current = difficulty; }, [difficulty]);
  useEffect(() => { boardStateRef.current = boardState; }, [boardState]);


  useEffect(() => {
    try {
      const storedLogs = localStorage.getItem('checkersGameLogs');
      if (storedLogs) {
        const parsedLogs = JSON.parse(storedLogs);
        if (Array.isArray(parsedLogs)) {
          setGameLogs(parsedLogs);
        } else {
          console.warn("Stored game logs are not an array, ignoring.");
          localStorage.removeItem('checkersGameLogs'); 
        }
      }
    } catch (error) {
      console.error("Error loading game logs from localStorage:", error);
      localStorage.removeItem('checkersGameLogs'); 
    }
  }, []);
  
  const countBoardPieces = useCallback((currentBoard: BoardState) => {
    let userMen = 0, userKings = 0, aiMen = 0, aiKings = 0;
    for (let r = 0; r < currentBoard.length; r++) {
      for (let c = 0; c < currentBoard[r].length; c++) {
        const piece = currentBoard[r][c];
        if (piece.player === Player.USER) { 
          if (piece.type === PieceType.MAN) userMen++;
          else if (piece.type === PieceType.KING) userKings++;
        } else if (piece.player === Player.AI) {
          if (piece.type === PieceType.MAN) aiMen++;
          else if (piece.type === PieceType.KING) aiKings++;
        }
      }
    }
    return { userMen, userKings, aiMen, aiKings };
  }, []);

  const updateDrawConditionsState = useCallback((boardAfterMove: BoardState, move: Move, pieceTypeAtOrigin: PieceType, pieceTypeAtLanding: PieceType, playerMakingMoveIdentity: Player) => {
    const boardHash = hashBoard(boardAfterMove);
    const nextPlayerToActuallyMove = playerMakingMoveIdentity === Player.USER ? Player.AI : Player.USER;
    setGameHistory(prevHistory => [...prevHistory, { boardHash, playerToMove: nextPlayerToActuallyMove }]);

    const pieces = countBoardPieces(boardAfterMove);
    
    let userPlayerPiecesAreDominant = pieces.userKings >= 3 && pieces.aiKings === 1 && pieces.aiMen === 0; 
    let aiPlayerPiecesAreDominant = pieces.aiKings >= 3 && pieces.userKings === 1 && pieces.userMen === 0;  

    let dominantPieceOwner: Player | null = null;
    if (userPlayerPiecesAreDominant) dominantPieceOwner = Player.USER;
    if (aiPlayerPiecesAreDominant) dominantPieceOwner = Player.AI;

    setKingDominanceInfo(prevKingDomInfo => {
        if (dominantPieceOwner) {
            if (prevKingDomInfo.player === dominantPieceOwner) {
                return { ...prevKingDomInfo, moves: playerMakingMoveIdentity === dominantPieceOwner ? prevKingDomInfo.moves + 1 : prevKingDomInfo.moves };
            } else {
                return { player: dominantPieceOwner, moves: playerMakingMoveIdentity === dominantPieceOwner ? 1 : 0 };
            }
        }
        return { player: null, moves: 0 };
    });
    
    if (pieceTypeAtOrigin === PieceType.KING && !move.isJump) { 
        setStagnationMoveCount(prev => prev + 1);
    } else { 
        setStagnationMoveCount(0); 
    }

    const wasPromotion = pieceTypeAtOrigin === PieceType.MAN && pieceTypeAtLanding === PieceType.KING;
    const bothSidesHaveKings = pieces.userKings > 0 && pieces.aiKings > 0;

    if (bothSidesHaveKings && !move.isJump && !wasPromotion) {
        setKingEndgameNoProgressMoves(prev => prev + 1);
    } else {
        setKingEndgameNoProgressMoves(0);
    }
  }, [countBoardPieces]);

  const finalizeCurrentPlayerNotation = useCallback((
    plyParts: string[], 
    wasLastActionJump: boolean, 
    playerWhoMoved: Player 
  ) => {
    let plyString = "";
    if (plyParts.length > 0) {
      plyString = wasLastActionJump ? plyParts.join(':') : plyParts.join('-');
    }

    if (plyString.trim() === "" || plyString.trim() === ":" || plyString.trim() === "-") {
      console.warn(`[FinalizeNotation] Problematic plyString: "${plyString}" for move by ${playerWhoMoved}. Raw:`, plyParts);
      plyString = "..."; 
    }

    let localCurrentPlyWhitePart = currentPlyWhitePartRef.current;
    let localCurrentMoveNumber = currentMoveNumberRef.current;
    let localActiveGameMoves = [...activeGameMovesRef.current]; 

    if (playerWhoMoved === Player.USER) { 
      localCurrentPlyWhitePart = `${localCurrentMoveNumber}. ${plyString}`;
    } else { 
      const whiteMovePart = localCurrentPlyWhitePart ? localCurrentPlyWhitePart : `${localCurrentMoveNumber}. ...`;
      const newFullMove = `${whiteMovePart} ${plyString}`;
      localActiveGameMoves.push(newFullMove);
      localCurrentPlyWhitePart = null; 
      localCurrentMoveNumber += 1;
    }
    
    setCurrentPlyWhitePart(localCurrentPlyWhitePart);
    setCurrentMoveNumber(localCurrentMoveNumber);
    setActiveGameMoves(localActiveGameMoves);

    currentPlyWhitePartRef.current = localCurrentPlyWhitePart; 
    currentMoveNumberRef.current = localCurrentMoveNumber;
    activeGameMovesRef.current = localActiveGameMoves;

    setCurrentPlyRawNotation([]); 
    currentPlyRawNotationRef.current = []; 
  }, []);


  const animateAndApplyMove = useCallback(async (
    move: Move, 
    boardBeforeAnimationRender: BoardState, 
    movingPlayerPieceIdentity: Player 
  ): Promise<{ boardAfterMove: BoardState; jumpContinues: boolean; finalPieceTypeAtLanding: PieceType; pieceTypeAtOrigin: PieceType }> => {
    return new Promise(resolve => {
      const pieceToAnimate = boardBeforeAnimationRender[move.from.row][move.from.col];
      if (!pieceToAnimate || pieceToAnimate.player === Player.NONE || !pieceToAnimate.type) {
        console.error("[AnimateAndApplyMove] Error: Trying to animate an empty or invalid piece.", move, pieceToAnimate, boardBeforeAnimationRender);
        const { newBoard, pieceTypeAtOrigin, pieceTypeAtLanding } = applyMove(boardBeforeAnimationRender, move);
        const furtherJumps = move.isJump ? getValidMoves(newBoard, movingPlayerPieceIdentity, move.to, move.to) : [];
        resolve({ boardAfterMove: newBoard, jumpContinues: furtherJumps.length > 0, finalPieceTypeAtLanding: pieceTypeAtLanding, pieceTypeAtOrigin });
        return;
      }

      // Handle disappearing jumped piece if it's a jump
      if (move.isJump && move.jumpedPiece) {
        const jumpedPieceDetails = boardBeforeAnimationRender[move.jumpedPiece.row][move.jumpedPiece.col];
        if (jumpedPieceDetails.player !== Player.NONE && jumpedPieceDetails.type) {
          setDisappearingJumpedPieceInfo({
            player: jumpedPieceDetails.player,
            type: jumpedPieceDetails.type,
            pos: move.jumpedPiece,
            key: Date.now() + Math.random(),
            humanPlayerId: humanPlayerIdRef.current,
          });
        }
      }
  
      setAnimatingPieceDetails({
        player: pieceToAnimate.player,
        type: pieceToAnimate.type,
        from: move.from,
        to: move.to,
        animationKey: Date.now() + Math.random(), 
      });
  
      const boardForVisualAnimationDisplay = boardBeforeAnimationRender.map((r, rowIndex) =>
        r.map((sq, colIndex) => {
          if (rowIndex === move.from.row && colIndex === move.from.col) {
            return createEmptySquareState(); 
          }
          // If it's the jumped piece, it will be handled by DisappearingJumpedPiece, so render as empty here too for visual stage
          // or keep it, and let DisappearingJumpedPiece overlay. Let's keep it and overlay.
          return { ...sq }; 
        })
      );
      setBoardState(boardForVisualAnimationDisplay); 
      
      if (movingPlayerPieceIdentity === humanPlayerIdRef.current) {
          setSelectedPiecePos(null); 
          setValidMovesForSelected([]);
      }
  
      setTimeout(() => {
        const { newBoard: logicallyAppliedBoard, pieceJustMoved, pieceTypeAtOrigin, pieceTypeAtLanding } = applyMove(boardBeforeAnimationRender, move);
        
        setBoardState(logicallyAppliedBoard); 
        boardStateRef.current = logicallyAppliedBoard; 
        setAnimatingPieceDetails(null); 
        
        // Clear disappearing piece info slightly after main animation or based on its own duration
        // For simplicity, clearing it here. If CAPTURE_ANIMATION_DURATION_MS is shorter, it might visually disappear earlier.
        if (move.isJump) {
            setTimeout(() => setDisappearingJumpedPieceInfo(null), CAPTURE_ANIMATION_DURATION_MS - 50 > 0 ? CAPTURE_ANIMATION_DURATION_MS - 50 : 0); // Ensure it's cleared
        }
  
        updateDrawConditionsState(logicallyAppliedBoard, move, pieceTypeAtOrigin, pieceTypeAtLanding, movingPlayerPieceIdentity);
  
        let localIsNewPieceAction = isNewPieceActionRef.current;
        let localCurrentPlyRawNotation = [...currentPlyRawNotationRef.current]; 
  
        const fromNot = positionToNotation(move.from);
        const toNot = positionToNotation(move.to);
  
        if (localIsNewPieceAction) {
          localCurrentPlyRawNotation = [fromNot, toNot];
        } else { 
          localCurrentPlyRawNotation.push(toNot);
        }
        setCurrentPlyRawNotation(localCurrentPlyRawNotation); 
        currentPlyRawNotationRef.current = localCurrentPlyRawNotation; 
        
        setIsNewPieceAction(false); 
        isNewPieceActionRef.current = false; 
  
        let jumpContinues = false;
        if (move.isJump) {
          const furtherJumps = getValidMoves(logicallyAppliedBoard, movingPlayerPieceIdentity, pieceJustMoved, pieceJustMoved);
          if (furtherJumps.length > 0) {
            jumpContinues = true;
            setMidJumpPiecePos(pieceJustMoved); 
            if (movingPlayerPieceIdentity === humanPlayerIdRef.current) {
              setSelectedPiecePos(pieceJustMoved); 
              setValidMovesForSelected(furtherJumps);
            }
          }
        }
  
        if (!jumpContinues) {
          finalizeCurrentPlayerNotation(localCurrentPlyRawNotation, move.isJump, movingPlayerPieceIdentity);
          setMidJumpPiecePos(null); 
        }
        
        resolve({ boardAfterMove: logicallyAppliedBoard, jumpContinues, finalPieceTypeAtLanding: pieceTypeAtLanding, pieceTypeAtOrigin });
  
      }, ANIMATION_DURATION_MS);
    });
  }, [updateDrawConditionsState, finalizeCurrentPlayerNotation]); 


  const checkCurrentGameStatus = useCallback((boardToCheck: BoardState, playerWhoseTurnItIsBasedOnPieces: Player) => {
    const currentKingDominanceInfo = kingDominanceInfo;
    const currentStagnationMoveCount = stagnationMoveCount;
    const currentKingEndgameNoProgressMoves = kingEndgameNoProgressMoves;
    const currentGameHistory = gameHistory;

    let dominanceMovesForStatusCheck = currentKingDominanceInfo.player !== null ? currentKingDominanceInfo.moves : 0;

    const status = checkGameStatus(
        boardToCheck, 
        playerWhoseTurnItIsBasedOnPieces, 
        currentGameHistory, 
        dominanceMovesForStatusCheck, 
        currentStagnationMoveCount,
        currentKingEndgameNoProgressMoves
    );

    if (status !== GameStatus.PLAYING) {
      console.log(`[CheckStatus] Game Over. Status: ${status}.`);
      setGameStatus(status);
      setIsLoadingAI(false); 
      if (aiTimerRef.current) { clearInterval(aiTimerRef.current); aiTimerRef.current = null; }


      const resultString = getGameResultString(status);
      let finalLoggedMovesOutput: string[] = [];
      const localActiveGameMoves = [...activeGameMovesRef.current]; 
      const localCurrentPlyWhitePart = currentPlyWhitePartRef.current; 

      localActiveGameMoves.forEach(fullMove => {
          if (!fullMove.match(/^\d+\.\s*\.\.\.\s*\.\.\.$/)) { 
              finalLoggedMovesOutput.push(fullMove.trim());
          }
      });
      
      let lastLineContent = "";
      if (localCurrentPlyWhitePart && localCurrentPlyWhitePart.trim() !== "") { 
          lastLineContent = localCurrentPlyWhitePart.trim();
      }

      if (lastLineContent && !lastLineContent.match(/^\d+\.\s*\.\.\.$/)) { 
          finalLoggedMovesOutput.push(`${lastLineContent} {${resultString}}`);
      } else if (finalLoggedMovesOutput.length > 0) {
          const lastValidMoveIdx = finalLoggedMovesOutput.length - 1;
          if (!finalLoggedMovesOutput[lastValidMoveIdx].includes("{")) {
               finalLoggedMovesOutput[lastValidMoveIdx] += ` {${resultString}}`;
          } else if (lastLineContent.match(/^\d+\.\s*\.\.\.$/)) { 
               finalLoggedMovesOutput.push(`${lastLineContent} {${resultString}}`);
          }
      } else if (resultString !== "*") { 
          if (lastLineContent.match(/^\d+\.\s*\.\.\.$/)) { 
               finalLoggedMovesOutput.push(`${lastLineContent} {${resultString}}`);
          } else if (lastLineContent && lastLineContent.trim() !== "") { 
               finalLoggedMovesOutput.push(`${lastLineContent} {${resultString}}`);
          }
          else { 
               finalLoggedMovesOutput.push(`{${resultString}}`);
          }
      }
      
      finalLoggedMovesOutput = finalLoggedMovesOutput.filter(line => line.trim() !== "" && line.trim() !== "{" && line.trim() !== "}");


      const newLoggedGame: LoggedGame = {
        id: crypto.randomUUID(),
        moves: finalLoggedMovesOutput,
        result: resultString,
        date: new Date().toISOString(),
        humanPlayedAs: humanPlayerIdRef.current === Player.USER ? 'White' : 'Black',
        opponentType: `AI (${difficultyRef.current.charAt(0).toUpperCase() + difficultyRef.current.slice(1)})`
      };
      
      const updatedGameLog = [...gameLogsRef.current, newLoggedGame];
      setGameLogs(updatedGameLog); 
      gameLogsRef.current = updatedGameLog; 
      try {
        localStorage.setItem('checkersGameLogs', JSON.stringify(updatedGameLog));
      } catch (error) {
        console.error("Error saving game logs to localStorage:", error);
      }
    }
    return status;
  }, [kingDominanceInfo, stagnationMoveCount, kingEndgameNoProgressMoves, gameHistory]);

  const resetGameNotationStates = () => {
    setActiveGameMoves([]);
    setCurrentMoveNumber(1);
    setCurrentPlyWhitePart(null);
    setCurrentPlyRawNotation([]);
    setIsNewPieceAction(true);

    activeGameMovesRef.current = [];
    currentMoveNumberRef.current = 1;
    currentPlyWhitePartRef.current = null;
    currentPlyRawNotationRef.current = [];
    isNewPieceActionRef.current = true;
  };

  const resetGame = useCallback(() => {
    console.log(`[ResetGame] Human: ${humanPlayerIdRef.current}, AI: ${aiPlayerIdRef.current}. White (USER pieces) starts. Diff: ${difficultyRef.current}`);
    const initialBoard = initializeBoard();
    setBoardState(initialBoard);
    boardStateRef.current = initialBoard;
    setCurrentPlayer(Player.USER); 
    setSelectedPiecePos(null);
    setValidMovesForSelected([]);
    setGameStatus(GameStatus.PLAYING);
    setIsLoadingAI(false);
    setMidJumpPiecePos(null);
    setShowApiKeyError(!isGeminiAvailable());
    setAnimatingPieceDetails(null);
    setDisappearingJumpedPieceInfo(null); 
    
    setGameHistory([{ boardHash: hashBoard(initialBoard), playerToMove: Player.USER }]); 
    setKingDominanceInfo({ player: null, moves: 0 });
    setStagnationMoveCount(0);
    setKingEndgameNoProgressMoves(0);
    
    resetGameNotationStates();

    setAiThinkingTime(0);
    if (aiTimerRef.current) {
      clearInterval(aiTimerRef.current);
      aiTimerRef.current = null;
    }
  }, []); 

  useEffect(() => {
    setGeminiReady(isGeminiAvailable());
    setShowApiKeyError(!isGeminiAvailable());
  }, []);

  useEffect(() => {
    if (gameScreen === 'game') {
      resetGame();
    }
  }, [gameScreen, humanPlayerId, aiPlayerId, difficulty, resetGame]); 

  const handleStartGame = useCallback((config: { color: 'white' | 'black' | 'random', difficulty: DifficultyLevel }) => {
    let newHumanPlayerId: Player;
    if (config.color === 'random') {
      newHumanPlayerId = Math.random() < 0.5 ? Player.USER : Player.AI;
    } else {
      newHumanPlayerId = config.color === 'white' ? Player.USER : Player.AI;
    }
    
    setHumanPlayerId(newHumanPlayerId);
    setAiPlayerId(newHumanPlayerId === Player.USER ? Player.AI : Player.USER);
    setDifficulty(config.difficulty); 
    
    setGameScreen('game'); 
  }, []);

  const handleViewRules = useCallback(() => setGameScreen('rules'), []);
  const handleCloseRules = useCallback(() => setGameScreen('setup'), []);
  const handleViewAbout = useCallback(() => setGameScreen('about'), []);
  const handleCloseAbout = useCallback(() => setGameScreen('setup'), []);
  const handleViewGameLogs = useCallback(() => setGameScreen('gameLogList'), []);
  const handleCloseGameLogs = useCallback(() => setGameScreen('setup'), []);
  const handleViewSingleLog = useCallback((log: LoggedGame) => {
    setSelectedLogForView(log);
    setGameScreen('gameLogView');
  }, []);
  const handleCloseSingleLogView = useCallback(() => {
    setSelectedLogForView(null);
    setGameScreen('gameLogList');
  }, []);
  const handleClearAllLogs = useCallback(() => {
    if (window.confirm("Are you sure you want to delete all game logs? This cannot be undone.")) {
      setGameLogs([]);
      gameLogsRef.current = []; 
      localStorage.removeItem('checkersGameLogs');
    }
  }, []);
  
  const handleNewGameClick = useCallback(() => {
    if (gameScreen === 'game') {
      resetGame(); 
    } else { 
      setGameScreen('setup');
    }
  }, [gameScreen, resetGame]);

  const handleBackToMenu = useCallback(() => {
    setGameScreen('setup');
     if (aiTimerRef.current) { 
      clearInterval(aiTimerRef.current);
      aiTimerRef.current = null;
    }
    setIsLoadingAI(false); 
    setAiThinkingTime(0);
    resetGameNotationStates(); 
    setAnimatingPieceDetails(null);
    setDisappearingJumpedPieceInfo(null);
  }, []);

  const switchPlayer = useCallback(() => {
    setCurrentPlayer(prevPlayer => {
      const newCurrentPlayer = prevPlayer === Player.USER ? Player.AI : Player.USER; 
      setIsNewPieceAction(true); 
      isNewPieceActionRef.current = true; 
      return newCurrentPlayer;
    });
    setSelectedPiecePos(null);
    setValidMovesForSelected([]);
  }, []);
  
  const makeAIMoveInternal = useCallback(async (currentBoardForAI: BoardState, currentAiControlledPiecesIdentity: Player, currentDifficultySetting: DifficultyLevel, aiMidJumpFromPos?: Position) => {
    if (animatingPieceDetails || disappearingJumpedPieceInfo) { 
      console.warn("[AIMoveInternal] Called while animation in progress. Aborting.");
      return;
    }
    
    if (!aiMidJumpFromPos) { 
      const statusBeforeAIMove = checkCurrentGameStatus(currentBoardForAI, currentAiControlledPiecesIdentity); 
      if (statusBeforeAIMove !== GameStatus.PLAYING) {
        setIsLoadingAI(false); 
        return; 
      }
    }
    
    setIsLoadingAI(true); 
    if (!aiMidJumpFromPos) { 
        setAiThinkingTime(0);
        if (aiTimerRef.current) clearInterval(aiTimerRef.current);
        aiTimerRef.current = window.setInterval(() => setAiThinkingTime(prev => prev + 1), 10);
    }

    const aiValidMoves = getValidMoves(currentBoardForAI, currentAiControlledPiecesIdentity, aiMidJumpFromPos, aiMidJumpFromPos);
    
    if (aiValidMoves.length === 0) { 
      if (!aiMidJumpFromPos) { 
         const humanIdentity = currentAiControlledPiecesIdentity === Player.USER ? Player.AI : Player.USER;
         checkCurrentGameStatus(currentBoardForAI, humanIdentity); 
      }
      setIsLoadingAI(false);
      if (aiTimerRef.current) { clearInterval(aiTimerRef.current); aiTimerRef.current = null; }
      return;
    }

    const chosenMove = aiMidJumpFromPos 
      ? aiValidMoves[0] 
      : await getAIMove(currentBoardForAI, currentAiControlledPiecesIdentity, aiValidMoves, 
          currentDifficultySetting === 'standard' ? 'medium' : currentDifficultySetting as 'easy' | 'hard'); 
    
    if (aiTimerRef.current && !aiMidJumpFromPos) { 
        clearInterval(aiTimerRef.current);
        aiTimerRef.current = null;
    }

    if (chosenMove) {
      const { boardAfterMove, jumpContinues } = await animateAndApplyMove(chosenMove, currentBoardForAI, currentAiControlledPiecesIdentity);
      
      if (jumpContinues) {
          // Add a slight delay to ensure current animation sequence visually settles if needed,
          // or to allow DisappearingJumpedPiece to clear if its duration is shorter.
          setTimeout(() => makeAIMoveInternal(boardAfterMove, currentAiControlledPiecesIdentity, currentDifficultySetting, chosenMove.to), ANIMATION_DURATION_MS / 2); 
      } else {
          const humanIdentity = currentAiControlledPiecesIdentity === Player.USER ? Player.AI : Player.USER;
          const newStatus = checkCurrentGameStatus(boardAfterMove, humanIdentity); 
          if (newStatus === GameStatus.PLAYING) {
            switchPlayer(); 
          }
          setIsLoadingAI(false); 
      }
    } else { 
        console.error(`[AIMoveInternal] AI (controls ${currentAiControlledPiecesIdentity}) failed. ChosenMove null. Difficulty: ${currentDifficultySetting}`);
        setGameStatus(GameStatus.AI_ERROR); 
        const randomFallbackMove = aiValidMoves[Math.floor(Math.random() * aiValidMoves.length)];
        if (randomFallbackMove) {
            const { boardAfterMove, jumpContinues } = await animateAndApplyMove(randomFallbackMove, currentBoardForAI, currentAiControlledPiecesIdentity);
            if (jumpContinues) {
                setTimeout(() => makeAIMoveInternal(boardAfterMove, currentAiControlledPiecesIdentity, currentDifficultySetting, randomFallbackMove.to), ANIMATION_DURATION_MS / 2);
            } else {
               const humanIdentity = currentAiControlledPiecesIdentity === Player.USER ? Player.AI : Player.USER;
               const newStatus = checkCurrentGameStatus(boardAfterMove, humanIdentity);
               if (newStatus === GameStatus.PLAYING) switchPlayer();
               setIsLoadingAI(false);
            }
        } else { 
            setIsLoadingAI(false);
        }
    }
  }, [animateAndApplyMove, switchPlayer, checkCurrentGameStatus, disappearingJumpedPieceInfo, animatingPieceDetails]); 


  useEffect(() => {
    if (currentPlayer === aiPlayerIdRef.current && gameStatus === GameStatus.PLAYING && !isLoadingAI && !midJumpPiecePos && !animatingPieceDetails && !disappearingJumpedPieceInfo) {
      const delayTimer = window.setTimeout(() => {
        makeAIMoveInternal(boardStateRef.current, aiPlayerIdRef.current, difficultyRef.current, undefined); 
      }, 500); 
      
      return () => clearTimeout(delayTimer);
    }
  }, [currentPlayer, gameStatus, isLoadingAI, midJumpPiecePos, animatingPieceDetails, disappearingJumpedPieceInfo, makeAIMoveInternal]);

  useEffect(() => {
    if (!isLoadingAI && aiTimerRef.current) { 
      clearInterval(aiTimerRef.current);
      aiTimerRef.current = null;
    }
  }, [isLoadingAI]); 

  const handleSquareClick = useCallback((row: number, col: number) => {
    if (gameStatus !== GameStatus.PLAYING || currentPlayer !== humanPlayerIdRef.current || isLoadingAI || animatingPieceDetails || disappearingJumpedPieceInfo) {
      return;
    }

    const clickedPos = { row, col };
    const currentBoard = boardStateRef.current;
    const pieceAtClickedPos = currentBoard[row][col];

    if (midJumpPiecePos) { 
      if (selectedPiecePos && selectedPiecePos.row === midJumpPiecePos.row && selectedPiecePos.col === midJumpPiecePos.col) {
        const move = validMovesForSelected.find(m => m.to.row === row && m.to.col === col);
        if (move) {
          (async () => {
            const { boardAfterMove, jumpContinues } = await animateAndApplyMove(move, currentBoard, humanPlayerIdRef.current);
            if (!jumpContinues) {
              const aiIdentity = aiPlayerIdRef.current;
              const newStatus = checkCurrentGameStatus(boardAfterMove, aiIdentity);
              if (newStatus === GameStatus.PLAYING) {
                switchPlayer();
              }
            }
          })();
        }
      }
      return;
    }

    if (pieceAtClickedPos.player === humanPlayerIdRef.current) {
      setSelectedPiecePos(clickedPos);
      const moves = getValidMoves(currentBoard, humanPlayerIdRef.current, clickedPos, undefined);
      setValidMovesForSelected(moves);
    } else if (selectedPiecePos && pieceAtClickedPos.player === Player.NONE) {
      const move = validMovesForSelected.find(m => m.to.row === row && m.to.col === col);
      if (move) {
        (async () => {
          const { boardAfterMove, jumpContinues } = await animateAndApplyMove(move, currentBoard, humanPlayerIdRef.current);
          if (!jumpContinues) {
            const aiIdentity = aiPlayerIdRef.current;
            const newStatus = checkCurrentGameStatus(boardAfterMove, aiIdentity);
            if (newStatus === GameStatus.PLAYING) {
              switchPlayer();
            }
          }
        })();
      } else {
        setSelectedPiecePos(null);
        setValidMovesForSelected([]);
      }
    } else {
      setSelectedPiecePos(null);
      setValidMovesForSelected([]);
    }
  }, [gameStatus, currentPlayer, isLoadingAI, midJumpPiecePos, selectedPiecePos, validMovesForSelected, animateAndApplyMove, switchPlayer, checkCurrentGameStatus, animatingPieceDetails, disappearingJumpedPieceInfo]);


  return (
    <div className="app-container min-h-screen flex flex-col items-center text-inherit"> {/* Inherit text color from body, body handles transitions */}
      <header className="w-full p-3 sm:p-4 shadow-md bg-[var(--header-bg)] sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="shrink-0">
            <LogoText />
          </div>
          <div className="shrink-0">
             <ThemeToggleButton />
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-4xl mx-auto p-3 sm:p-4 flex flex-col items-center">
        {gameScreen === 'setup' && (
          <SetupScreen
            onStartGame={handleStartGame}
            onViewRules={handleViewRules}
            onViewAbout={handleViewAbout}
            onViewLogs={handleViewGameLogs}
          />
        )}
        {gameScreen === 'game' && (
          <div className="flex flex-col items-center w-full">
            <GameStatusDisplay
              status={gameStatus}
              currentPlayer={currentPlayer}
              humanPlayerId={humanPlayerId}
              isLoadingAI={isLoadingAI}
              isGeminiReady={geminiReady}
              onNewGame={handleNewGameClick}
              aiThinkingTime={aiThinkingTime}
            />
            {showApiKeyError && !geminiReady && (
               <p className="text-red-500 bg-red-100 dark:bg-red-900/50 dark:text-red-300 p-3 rounded-md shadow-sm text-sm text-center my-2 max-w-md border border-red-300 dark:border-red-700">
                  {API_KEY_ERROR_MESSAGE} <br/> AI will make random moves.
               </p>
            )}
            <Board
              boardState={boardState} 
              onSquareClick={handleSquareClick}
              selectedPiecePos={selectedPiecePos}
              validMovesForSelected={validMovesForSelected}
              disabled={
                gameStatus !== GameStatus.PLAYING ||
                isLoadingAI ||
                (currentPlayer !== humanPlayerIdRef.current && !midJumpPiecePos) || 
                (midJumpPiecePos && currentPlayer !== humanPlayerIdRef.current) || 
                !!animatingPieceDetails ||
                !!disappearingJumpedPieceInfo 
              }
              humanPlayerId={humanPlayerId}
              animatingPieceDetails={animatingPieceDetails}
              animationDuration={ANIMATION_DURATION_MS}
              disappearingJumpedPieceInfo={disappearingJumpedPieceInfo}
              captureAnimationDuration={CAPTURE_ANIMATION_DURATION_MS}
            />
             <button
                onClick={handleBackToMenu}
                className="mt-5 sm:mt-6 px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-pink-400 dark:focus:ring-purple-500 focus:ring-opacity-75 transition-all duration-150 ease-in-out text-base sm:text-lg"
              >
                Back to menu
              </button>
          </div>
        )}
        {gameScreen === 'rules' && <RulesScreen onClose={handleCloseRules} />}
        {gameScreen === 'about' && <AboutScreen onClose={handleCloseAbout} />}
        {gameScreen === 'gameLogList' && <GameLogListScreen logs={gameLogs} onSelectLog={handleViewSingleLog} onClose={handleCloseGameLogs} onClearLogs={handleClearAllLogs} />}
        {gameScreen === 'gameLogView' && selectedLogForView && <GameLogViewScreen log={selectedLogForView} onClose={handleCloseSingleLogView} />}
      </main>

      <footer className="w-full p-3 text-center text-xs text-neutral-500 dark:text-neutral-400 border-t border-neutral-300/50 dark:border-neutral-700/50 mt-auto">
        AI-Checkers v{APP_VERSION}
      </footer>
    </div>
  );
};

export default App;