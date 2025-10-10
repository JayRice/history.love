export default interface Photo {
  name?: string;
  uri?: string;
  width: number;
  height: number;
  type: string;

  // Data
  downloadURL?: string;
};