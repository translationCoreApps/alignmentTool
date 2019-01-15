/**
 * Helper utility to generate data for the menu.
 * @param {[]} index - the group index
 * @param {object} data - the group data
 * @param {string} progressKey - the key by which the group progress will be measured
 * @param {function} [onProcessItem=null] - an optional callback to perform additional processing on a menu item. This is executed before the `progressKey` is evaluated.
 * @returns {[]} the menu data
 */
export function generateMenuData(
  index,
  data,
  progressKey,
  onProcessItem = null
) {
  const menu = [];

  for (let i = 0, len = index.length; i < len; i++) {
    if (Object.keys(data).includes(index[i].id)) {
      // generate menu group
      const children = data[index[i].id].map(item => {
        if (typeof onProcessItem === "function") {
          return onProcessItem(item);
        } else {
          return generateMenuItem(item);
        }
      });
      menu.push({
        title: index[i].name,
        progress: calculateProgress(children, progressKey),
        id: index[i].id,
        children
      });
    }
  }

  return menu;
}

/**
 * Calculates the progress over an array of objects
 * @param {object[]} data - an array of objects
 * @param {*} progressKey - the key used to check the completion status of each object
 * @returns {number} - returns a number between 0 and 100 inclusive
 */
function calculateProgress(data, progressKey) {
  const total = data.length;
  let completed = 0;
  for (const item of data) {
    if (item[progressKey]) {
      completed++;
    }
  }
  return (completed / total) * 100;
}

/**
 * Performs some default child generation operations.
 * For advanced menu item customization you should provide a callback to {@link generateMenuData}
 * @param {object} data - the menu item data
 * @returns {object} - the formatted menu item data
 */
function generateMenuItem(data) {
  const {
    contextId: {
      reference: { bookId, chapter, verse }
    }
  } = data;
  const passageTitle = `${bookId} ${chapter}:${verse}`;

  return {
    ...data,
    title: `${passageTitle}`
  };
}