export default async function assertAsyncThrows (f) {
  try { await f() }
  catch (err) { return err }
  throw new Error(`Expected function to throw an error`)
}
