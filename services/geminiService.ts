import { GoogleGenerativeAI } from "@google/generative-ai";
import { BoardState, Move, Player, AISuggestion, API_KEY_ERROR_MESSAGE } from '../types.ts';
import { boardToText, movesToText } from './checkersLogic.ts';

const API_KEY = process.env.API_KEY;

let ai: GoogleGenerativeAI | null = null;
if (API_KEY) {
  ai = new GoogleGenerativeAI(API_KEY);
} else {
  console.error(API_KEY_ERROR_MESSAGE);
}

function generatePrompt(
  boardState: BoardState,
  aiPlayer: Player,
  availableMoves: Move[],
  difficulty: 'easy' | 'medium' | 'hard'
): string {
  const boardDescription = boardToText(boardState, aiPlayer);
  const movesDescription = movesToText(availableMoves);
  
  const aiPieceSymbol = aiPlayer === Player.USER ? "U/UK (White)" : "A/AK (Black)";
  const opponentPieceSymbol = aiPlayer === Player.USER ? "A/AK (Black)" : "U/UK (White)";

  let difficultyPrompt = "";
  switch (difficulty) {
    case 'easy':
      difficultyPrompt = "Make simple moves, focusing on immediate captures.";
      break;
    case 'hard':
      difficultyPrompt = "Play like a grandmaster, considering all tactical and strategic possibilities.";
      break;
    default:
      difficultyPrompt = "Play like a skilled player, balancing offense and defense.";
  }

  return `
You are controlling the ${aiPieceSymbol} pieces.
The opponent controls the ${opponentPieceSymbol} pieces.
'U' or 'A' are men. 'UK' or 'AK' are kings.
'.' are empty playable squares. ' ' are unplayable light squares.

${difficultyPrompt}

Current board state:
${boardDescription}

Available moves:
${movesDescription}

Respond ONLY with the chosen move in JSON format: {"from": {"row": R, "col": C}, "to": {"row": R, "col": C}}
`;
}

function findMatchingMove(suggestedMove: AISuggestion, availableMoves: Move[]): Move | null {
  return availableMoves.find(
    m => m.from.row === suggestedMove.from.row &&
         m.from.col === suggestedMove.from.col &&
         m.to.row === suggestedMove.to.row &&
         m.to.col === suggestedMove.to.col
  ) || null;
}

export async function getAIMove(
  boardState: BoardState,
  aiPlayer: Player,
  availableMoves: Move[],
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<Move | null> {
  if (!process.env.API_KEY) {
    throw new Error(API_KEY_ERROR_MESSAGE);
  }

  const ai = new GoogleGenerativeAI(process.env.API_KEY);
  const model = ai.getGenerativeModel({ model: "gemini-pro" });

  const userPrompt = generatePrompt(boardState, aiPlayer, availableMoves, difficulty);

  try {
    const result = await model.generateContent(userPrompt);
    const text = result.response.text();
    
    if (!text) {
      throw new Error('No response from Gemini API');
    }

    const aiSuggestedMove = parseJsonFromGeminiResponse(text);

    if (aiSuggestedMove) {
      const matchedMove = findMatchingMove(aiSuggestedMove, availableMoves);
      if (matchedMove) {
        return matchedMove;
      } else {
        console.error("AI suggested a move not in the available list:", aiSuggestedMove, "Available:", availableMoves, "Prompt Snippet:", userPrompt.substring(0, 500), "Response Text:", text);
      }
    } else {
      console.error("AI response parsing failed or returned null. Response Text:", text, "Prompt Snippet:", userPrompt.substring(0,500));
    }
  } catch (error) {
    console.error("Error getting AI move:", error);
  }

  // Fallback to random move if AI fails
  return availableMoves[Math.floor(Math.random() * availableMoves.length)] || null;
}

function parseJsonFromGeminiResponse(text: string): AISuggestion | null {
  try {
    const move = JSON.parse(text);
    if (move && move.from && move.to &&
        typeof move.from.row === 'number' && typeof move.from.col === 'number' &&
        typeof move.to.row === 'number' && typeof move.to.col === 'number') {
      return move;
    }
  } catch (e) {
    console.error("Failed to parse AI response as JSON:", e);
  }
  return null;
}

export const isGeminiAvailable = (): boolean => !!ai;
