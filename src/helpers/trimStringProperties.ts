/* eslint-disable prefer-const */
/* eslint-disable no-param-reassign */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable consistent-return */
function cleanupText(text) {
  return (
    text &&
    text // Ensure text exists
      .trim() // Trim left and right spaces
      .replace(/\n{2,}/g, "\n\n") // Replace 2+ linebreaks with 2 ones
      .replace(/ +/g, " ")
  ); // Replace consecutive spaces with one
}

export const trimStringProperties = (obj) => {
  if (obj !== null && typeof obj === "object") {
    for (let prop in obj) {
      // if the property is an object trim it too
      if (typeof obj[prop] === "object") {
        // eslint-disable-next-line no-undef
        return trimStringProperties(obj[prop]);
      }

      // if it's a string remove begin and end whitespaces
      if (typeof obj[prop] === "string") {
        // obj[prop] = obj[prop].trim();
        obj[prop] = cleanupText(obj[prop]);
      }
    }
  }
};
