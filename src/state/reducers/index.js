import {combineReducers} from 'redux';
import alignments, * as fromAlignments from './alignments';

export default combineReducers({
  alignments
});

/**
 * Checks if data for the chapter has been loaded
 * @param state
 * @param {number} chapter
 * @return {boolean}
 */
export const getIsChapterLoaded = (state, chapter) =>
  fromAlignments.getIsChapterLoaded(state.tool.alignments, chapter);

/**
 * Returns alignments for a verse
 * @param state
 * @param chapter
 * @param verse
 * @return {*}
 */
export const getVerseAlignments = (state, chapter, verse) =>
  fromAlignments.getVerseAlignments(state.tool.alignments, chapter, verse);

/**
 * Returns an array of target tokens that have been aligned to the verse
 * @param state
 * @param {number} chapter
 * @param {number} verse
 * @return {Array}
 */
export const getVerseAlignedTargetTokens = (state, chapter, verse) =>
  fromAlignments.getVerseAlignedTargetTokens(state.tool.alignments, chapter, verse);

/**
 * Checks if the verses being aligned are valid
 * @param state
 * @param {string} targetText - the target text used as a baseline
 * @param {string} sourceText - the source text used as a baseline
 * @param {number} chapter
 * @param {number} verse
 * @return {*}
 */
export const getIsVerseValid = (state, chapter, verse, sourceText, targetText) =>
  fromAlignments.getIsVerseValid(state.tool.alignments, chapter, verse, sourceText, targetText);

/**
 * Returns the chapter alignments in the legacy format
 * @param state
 * @param chapter
 */
export const getLegacyChapterAlignments = (state, chapter) =>
  fromAlignments.getLegacyChapterAlignments(state.tool.alignments, chapter);

/**
 * Checks if a verse has been fully aligned
 * @param state
 * @param chapter
 * @param verse
 * @return {*}
 */
export const getIsVerseAligned = (state, chapter, verse) =>
  fromAlignments.getIsVerseAligned(state.tool.alignments, chapter, verse);

export function getManifest(state) {
  return state.projectDetailsReducer.manifest;
}

export function getProjectSaveLocation(state) {
  return state.projectDetailsReducer.projectSaveLocation;
}

export function getContextId(state) {
  return state.contextIdReducer.contextId;
}