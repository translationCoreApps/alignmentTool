import * as actions from '../index';
import {Token} from 'wordmap-lexer';
import {Prediction, Alignment, Ngram} from 'wordmap';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  ALIGN_RENDERED_SOURCE_TOKEN,
  INSERT_RENDERED_ALIGNMENT,
  SET_ALIGNMENT_SUGGESTIONS,
  UNALIGN_RENDERED_SOURCE_TOKEN
} from '../actionTypes';
import _ from "lodash";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('thunk actions', () => {
  const initialState = {
    tool: {
      alignments: {
        "1": {
          "1": {
            alignments: [
              {
                "sourceNgram": [
                  0,
                  1,
                  3,
                  4
                ],
                "targetNgram": []
              },
              {
                "sourceNgram": [
                  2
                ],
                "targetNgram": []
              }
            ],
            sourceTokens: [
              {
                "text": "Παῦλος",
                "position": 0,
                "occurrence": 1,
                "occurrences": 1,
                "strong": "G39720",
                "lemma": "Παῦλος",
                "morph": "Gr,N,,,,,NMS,"
              },
              {
                "text": "δοῦλος",
                "position": 1,
                "occurrence": 1,
                "occurrences": 1,
                "strong": "G14010",
                "lemma": "δοῦλος",
                "morph": "Gr,N,,,,,NMS,"
              },
              {
                "text": "Θεοῦ",
                "position": 2,
                "occurrence": 1,
                "occurrences": 2,
                "strong": "G23160",
                "lemma": "θεός",
                "morph": "Gr,N,,,,,GMS,"
              },
              {
                "text": "ἀπόστολος",
                "position": 3,
                "occurrence": 1,
                "occurrences": 1,
                "strong": "G06520",
                "lemma": "ἀπόστολος",
                "morph": "Gr,N,,,,,NMS,"
              },
              {
                "text": "δὲ",
                "position": 4,
                "occurrence": 1,
                "occurrences": 1,
                "strong": "G11610",
                "lemma": "δέ",
                "morph": "Gr,CC,,,,,,,,"
              }
            ],
            targetTokens: []
          }
        }
      }
    }
  };
  
  it('unmerges source token to merge with alignment on the right', () => {
    const expectedActions = [
      {
        'chapter': 1,
        'index': 0,
        'token': {'index': 0, 'occurrence': 1, 'occurrences': 1},
        'type': UNALIGN_RENDERED_SOURCE_TOKEN,
        'verse': 1
      },
      {
        'chapter': 1,
        'index': 1,
        'token': {'index': 0, 'occurrence': 1, 'occurrences': 1},
        'type': ALIGN_RENDERED_SOURCE_TOKEN,
        'verse': 1
      }];
    const state = _.cloneDeep(initialState);
    const store = mockStore(state);
    const action = actions.moveSourceToken(1, 1, 1, 0,
      new Token({text: 'hello'}).toJSON() // TRICKY: simplifies test output
    );
    store.dispatch(action);
    const results = store.getActions();
    expect(results).toEqual(expectedActions);
  });

  it('merges source token to the left', () => {
    const expectedActions = [
      {
        'chapter': 1,
        'index': 1,
        'token': {'index': 0, 'occurrence': 1, 'occurrences': 1},
        'type': UNALIGN_RENDERED_SOURCE_TOKEN,
        'verse': 1
      },
      {
        'chapter': 1,
        'index': 0, // NOTE: this remains nextIndex
        'token': {'index': 0, 'occurrence': 1, 'occurrences': 1},
        'type': ALIGN_RENDERED_SOURCE_TOKEN,
        'verse': 1
      }];
    const state = _.cloneDeep(initialState);
    const store = mockStore(state);
    const action = actions.moveSourceToken(1, 1, 0, 1,
      new Token({text: 'hello'}).toJSON() // TRICKY: simplifies test output
    );
    store.dispatch(action);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('unmerges source token to same position (insert)', () => {
    const expectedActions = [
      {
        'chapter': 1,
        'index': 1,
        'token': {'index': 0, 'occurrence': 1, 'occurrences': 1},
        'type': UNALIGN_RENDERED_SOURCE_TOKEN,
        'verse': 1
      },
      {
        'chapter': 1,
        'token': {'index': 0, 'occurrence': 1, 'occurrences': 1},
        'type': INSERT_RENDERED_ALIGNMENT,
        'verse': 1
      }];
    const state = _.cloneDeep(initialState);
    const store = mockStore(state);
    const action = actions.moveSourceToken(1, 1, 1, 1,
      new Token({text: 'hello'}).toJSON() // TRICKY: simplifies test output
    );
    store.dispatch(action);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('sets alignment suggestions', () => {
    const sourceTokens = [new Token({text: 'hello'})];
    const targetTokens = [new Token({text: 'world'})];
    const expectedActions = [
      {
        type: SET_ALIGNMENT_SUGGESTIONS,
        chapter: 1,
        verse: 1,
        alignments: [
          {
            sourceNgram: sourceTokens,
            targetNgram: targetTokens
          }]
      }
    ];
    const store = mockStore();
    const source = new Ngram(sourceTokens);
    const target = new Ngram(targetTokens);

    const prediction = new Prediction(new Alignment(source, target));
    prediction.setScore('confidence', 1);
    const action = actions.setAlignmentPredictions(1, 1, [prediction]);
    store.dispatch(action);
    expect(store.getActions()).toEqual(expectedActions);
  });
});
