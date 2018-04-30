/**
 * Migrates a topWord to a source token (json format)
 * @param word
 * @return {*}
 */
const migrateTopWord = word => ({
  text: word.word,
  strong: word.strong ? word.strong : word.strongs,
  lemma: word.lemma,
  morph: word.morph,
  occurrence: word.occurrence,
  occurrences: word.occurrences
});

/**
 * Migrates a bottomWord to a target token (json format)
 * @param word
 * @return {{text: *, occurrence: *, occurrences: *}}
 */
const migrateBottomWord = word => ({
  text: word.word,
  occurrence: word.occurrence,
  occurrences: word.occurrences
});

/**
 * Searches for a token in the array that matches the given parameters
 * @param {Token[]} tokens
 * @param {string} text
 * @param {number} occurrence
 * @param {number} occurrences
 * @return {Token}
 */
const findToken = (tokens, text, occurrence, occurrences) => {
  for (const token of tokens) {
    if (token.toString() === text
      && token.occurrence === occurrence
      && token.occurrences === occurrences) {
      return token;
    }
  }
  return null;
};

/**
 * A comparator used for sorting objects by their position key.
 * @param a
 * @param b
 */
const positionComparator = (a, b) => {
  if (a.position < b.position) {
    return -1;
  }
  if (a.position > b.position) {
    return 1;
  }
  return 0;
};

/**
 * Returns the index of a token in the array that matches the given parameters
 * @param {object[]} tokens - an array of json tokens (not {@Token}'s)
 * @param {text} text
 * @param {number} occurrence
 * @param {number} occurrences
 * @return {number} the index of the token or -1
 */
const indexOfToken = (tokens, text, occurrence, occurrences) => {
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].text === text
      && tokens[i].occurrence === occurrence
      && tokens[i].occurrences === occurrences) {
      return i;
    }
  }
  return -1;
};

/**
 * Migrates chapter alignment data to a form usable by the tool.
 * Note: this only performs alignment validation not sentence validation.
 * You should validate the sentences (sourceTokens and targetTokens) for consistency after migration.
 *
 * @param {object} data - the chapter alignment data
 * @param {object} sourceTokens - a dictionary of tokenized source sentences as a baseline
 * @param {object} targetTokens - a dictionary of tokenized target sentences as a baseline
 * @return {*}
 * @throws {AlignmentError} if any of the alignments are invalid
 */
export const migrateChapterAlignments = (data, sourceTokens, targetTokens) => {
  const interchangeData = formatAlignmentData(data);
  return normalizeAlignmentData(interchangeData, sourceTokens, targetTokens);
};

/**
 * Formats legacy alignment data into a usable form.
 * Note: this is not a full migration, because we are missing some data.
 * You should execute {@link normalizeAlignmentData} on the output of this method.
 * This is exported only for testing.
 *
 * @param {object} data - the raw alignment data
 * @throws Throws an error if the data is invalid
 * @example
 * // input data format
 * {
 *   "1": {
 *      "alignments": [
 *        {
 *          "topWords": [...],
 *          "bottomWords": [...]
 *        }
 *      ],
 *      "wordBank": [...]
 *   }
 * }
 * // where words are like:
 * {
 *  "word": "",
 *  "strong": "",
 *  "lemma": "",
 *  "morph": "",
 *  "occurrence": 1,
 *  "occurrences: 1
 * }
 */
export const formatAlignmentData = (data) => {
  const migratedData = {};
  for (const verse of Object.keys(data)) {
    let targetTokens = [];
    let sourceTokens = [];
    const alignments = [];

    for (const alignment of data[verse].alignments) {
      const sourceNgram = alignment.topWords.map(migrateTopWord);
      const targetNgram = alignment.bottomWords.map(migrateBottomWord);

      // organize source tokens
      sourceTokens = sourceTokens.concat(sourceNgram);

      // organize target tokens
      targetTokens = targetTokens.concat(targetNgram);

      // organize alignments
      alignments.push({
        sourceNgram,
        targetNgram
      });
    }

    // merge word bank into target tokens
    targetTokens = targetTokens.concat(
      data[verse].wordBank.map(migrateBottomWord));

    migratedData[verse] = {
      sourceTokens,
      targetTokens,
      alignments
    };
  }
  return migratedData;
};

/**
 * Finishes the migration by injecting some data, sorting, and simplifying the n-grams.
 * This is exported only for testing.
 *
 * @param data
 * @param {object} sourceTokensBaseline - a dictionary of tokenized source verses
 * @param {object} targetTokensBaseline - a dictionary of tokenized target verses
 * @throws will throw an error if the data is invalid
 * @throws {AlignmentError} if the alignment is invalid
 * @return {*}
 * @example
 * // input data format
 * {
 *    "1": {
 *      "sourceTokens": [...],
 *      "targetTokens": [...],
 *      "alignments": [{
 *        "sourceNgram": [...],
 *        "targetNgram": [...]
 *      }, ...]
 *    }
 * }
 * // where tokens are like:
 * {
 *    "text": "",
 *    "strong": "",
 *    "lemma": "",
 *    "morph": "",
 *    "occurrence": 1,
 *    "occurrences: 1
 * }
 */
export const normalizeAlignmentData = (
  data, sourceTokensBaseline, targetTokensBaseline) => {
  const normalizedData = {};
  for (const verse of Object.keys(data)) {
    let targetTokens = [];
    let sourceTokens = [];
    const alignments = [];

    // add position to target tokens
    for (const t of data[verse].targetTokens) {
      const baseline = findToken(targetTokensBaseline[verse], t.text, t.occurrence,
        t.occurrences);
      if (baseline) {
        targetTokens.push({
          ...t,
          position: baseline.position
        });
      } else {
        throw new AlignmentError(
          `Unexpected target token "${t.text} (${t.occurrence} of ${t.occurrences})" in verse ${verse}`);
      }
    }

    // add position to source tokens
    for (const t of data[verse].sourceTokens) {
      const baseline = findToken(sourceTokensBaseline[verse], t.text, t.occurrence,
        t.occurrences);
      if (baseline) {
        sourceTokens.push({
          ...t,
          position: baseline.position
        });
      } else {
        throw new AlignmentError(
          `Unexpected source token "${t.text} (${t.occurrence} of ${t.occurrences})" in verse ${verse}`);
      }
    }

    // sort sentence tokens
    sourceTokens.sort(positionComparator);
    targetTokens.sort(positionComparator);

    // simplify alignments
    for (const alignment of data[verse].alignments) {
      const sourceNgram = [];
      const targetNgram = [];

      // convert source tokens to indices
      for (const t of alignment.sourceNgram) {
        const index = indexOfToken(sourceTokens, t.text, t.occurrence,
          t.occurrences);
        if (index >= 0) {
          sourceNgram.push(index);
        } else {
          throw new AlignmentError(
            `Unexpected source token "${t.text} (${t.occurrence} of ${t.occurrences})" in alignment for verse ${verse}`);
        }
      }

      // convert target tokens to indices
      for (const t of alignment.targetNgram) {
        const index = indexOfToken(targetTokens, t.text, t.occurrence,
          t.occurrences);
        if (index >= 0) {
          targetNgram.push(index);
        } else {
          throw new AlignmentError(
            `Unexpected target token "${t.text} (${t.occurrence} of ${t.occurrences})" in alignment for verse ${verse}`);
        }
      }

      // sort n-grams
      sourceNgram.sort();
      targetNgram.sort();

      alignments.push({
        sourceNgram,
        targetNgram
      });
    }

    // sort alignments
    alignments.sort((a, b) => {
      return positionComparator(a.sourceNgram, b.sourceNgram);
    });

    normalizedData[verse] = {
      sourceTokens,
      targetTokens,
      alignments
    };
  }
  return normalizedData;
};

/**
 * An error indicating the word alignment is invalid
 */
class AlignmentError extends Error {
}
