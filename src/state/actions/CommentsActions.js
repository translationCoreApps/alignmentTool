import * as consts from '../actions/actionTypes';
import * as Actions from '../actions/index'

export function comment(text, username, timestamp) {
  return ((dispatch, getState) => {
    const { contextIdReducer: { contextId } } = getState();
    const {
      bookId, chapter, verse,
    } = contextId.reference;
    const {
      gatewayLanguageCode,
      gatewayLanguageQuote,
    } = gatewayLanguageHelpers.getGatewayLanguageCodeAndQuote(getState());

    dispatch({
      type: consts.ADD_COMMENT,
      userName: username,
      activeBook: bookId,
      activeChapter: chapter,
      activeVerse: verse,
      modifiedTimestamp: timestamp,
      gatewayLanguageCode,
      gatewayLanguageQuote,
      text,
    });
  });
}

/**
 * Add a comment for the current check.
 * @param {String} text - comment text.
 * @return {Object} New state for comment reducer.
 */
export const addComment = (text) => ((dispatch, getState) => {
  const state = getState();
  const {
    contextId: {
      reference: {
        chapter, verse,
      }
    }
  } = state.contextIdReducer;
  const username = state.loginReducer.userdata.username;

  dispatch(comment(text, username, generateTimestamp()));
  dispatch(Actions.setGroupMenuItemComment(chapter, verse, text));
});
