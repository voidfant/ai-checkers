export interface ProbeResponse<T = unknown> {
  status: 200;
  body: T;
}

export const httpOk = <T>(body: T): ProbeResponse<T> => ({
  status: 200,
  body,
});

export const expectHttpOk = <T>(response: ProbeResponse<T>) => {
  expect(response.status).toBe(200);
  return response.body;
};
