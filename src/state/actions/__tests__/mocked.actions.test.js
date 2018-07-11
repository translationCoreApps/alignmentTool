jest.mock('../../reducers');
import * as reducers from '../../reducers';
import * as actions from '../index';
import Token from 'word-map/structures/Token';

describe('repair and inspect verse', () => {

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('changes alignments', () => {
    reducers.__setVerseAlignmentsOnce([1, 2]);
    reducers.__setVerseAlignmentsOnce([0, 1]);
    const action = actions.repairAndInspectVerse(1, 1,
      [new Token({text: 'hello'}).toJSON()],
      [new Token({text: 'olleh'}).toJSON()]);

    const dispatch = jest.fn();
    const getState = jest.fn();
    getState.mockReturnValueOnce([1, 2]);
    getState.mockReturnValueOnce([1]);
    const result = action(dispatch, getState);
    expect(result).toEqual(true);
    expect(getState).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('does not change alignments', () => {
    reducers.__setVerseAlignmentsOnce([1, 2]);
    reducers.__setVerseAlignmentsOnce([1, 2]);
    const action = actions.repairAndInspectVerse(1, 1,
      [new Token({text: 'hello'}).toJSON()],
      [new Token({text: 'olleh'}).toJSON()]);

    const dispatch = jest.fn();
    const getState = jest.fn();
    getState.mockReturnValueOnce([1, 2]);
    getState.mockReturnValueOnce([1]);
    const result = action(dispatch, getState);
    expect(result).toEqual(false);
    expect(getState).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});
