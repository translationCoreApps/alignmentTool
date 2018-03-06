import XRegExp from 'xregexp';

export const word = XRegExp('[\\pL\\pM]+', '');
export const punctuation = XRegExp('(^\\p{P}|[<>]{2})', '');
export const whitespace = /\s+/;
const tokenizerOptions = {word, whitespace, punctuation};

/**
 * @Description - Tiny tokenizer - https://gist.github.com/borgar/451393
 * @Param {String} string - string to be tokenized
 * @Param {Object} parsers - { word:/\w+/, whitespace:/\s+/, punctuation:/[^\w\s]/ }
 * @Param {String} deftok - type to label tokens that are not classified with the above parsers
 * @Return {Array} - array of objects => [{ token:"this", type:"word" },{ token:" ", type:"whitespace" }, Object { token:"is", type:"word" }, ... ]
 **/
export const classifyTokens = (string, parsers, deftok) => {
  string = (!string) ? '' : string; // if string is undefined, make it an empty string
  if (typeof string !== 'string')
    throw 'tokenizer.tokenize() string is not String: ' + string;
  let m, r, t, tokens = [];
  while (string) {
    t = null;
    m = string.length;
    for ( const key in parsers ) {
      if(parsers.hasOwnProperty(key)) {
        r = parsers[key].exec(string);
        // try to choose the best match if there are several
        // where "best" is the closest to the current starting point
        if (r && (r.index < m)) {
          t = {
            token: r[0],
            type: key,
            matches: r.slice(1)
          };
          m = r.index;
        }
      }
    }
    if ( m ) {
      // there is text between last token and currently
      // matched token - push that out as default or "unknown"
      tokens.push({
        token : string.substr( 0, m ),
        type  : deftok || 'unknown'
      });
    }
    if ( t ) {
      // push current token onto sequence
      tokens.push( t );
    }
    string = string.substr( m + (t ? t.token.length : 0) );
  }
  return tokens;
};


/**
 * @Description - tokenize a string into an array of words
 * @Param {String} string - string to be tokenized
 * @Return {Array} - array of tokenized words/strings
 * TODO: move this to an external npm package to consume with other helpers
 */
export const tokenizeWithPunctuation = (string) => {
  const _tokens = classifyTokens(string, tokenizerOptions);
  return _tokens.filter(token => token.type === 'word' || token.type === 'punctuation')
  .map(token => token.token);
};

/**
 * gets the occurrence of a subString in a string by using the subString index in the string.
 * @param {String} string
 * @param {Number} currentWordIndex
 * @param {String} subString
 */
export const occurrenceInString = (string, currentWordIndex, subString) => {
  let occurrence = 0;
  const tokens = tokenize(string);
  for (let i = 0; i <= currentWordIndex; i++) {
    if (tokens[i] === subString) occurrence ++;
  }
  return occurrence;
};

/**
 * @Description - tokenize a string into an array of words
 * @Param {String} string - string to be tokenized
 * @Return {Array} - array of tokenized words/strings
 * TODO: move this to an external npm package to consume with other helpers
 */
export const tokenize = (string) => {
  const _tokens = classifyTokens(string, tokenizerOptions);
  return _tokens.filter(token => token.type === 'word')
  .map(token => token.token);
};

/**
 * @description Function that count occurrences of a substring in a string
 * @param {String} string - The string to search in
 * @param {String} subString - The sub string to search for
 * @returns {int} - the count of the occurrences
 */
export const occurrencesInString = (string, subString) => {
  let occurrences = 0;
  const tokens = tokenize(string);
  tokens.forEach(token => {
    if (token === subString) occurrences ++;
  });
  return occurrences;
};
