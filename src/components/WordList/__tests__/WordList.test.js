/* eslint-env jest */

import Token from 'word-map/structures/Token';
import React, {Component} from 'react';
import TestBackend from 'react-dnd-test-backend';
import {DragDropContext} from 'react-dnd';
import WordList from '../WordList';
import renderer from 'react-test-renderer';

describe('snapshot', () => {
  it('has no words', () => {
    const wrapper = renderer.create(
      <WordList isOver={false}
                words={[]}/>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('has words', () => {
    const WrappedWordList = wrapInTestContext(WordList);
    const w3 = new Token({text: 'w3'});
    w3.disabled = true;
    const words = [
      new Token({text: 'w1'}),
      new Token({text: 'w2'}),
      w3
    ];
    const wrapper = renderer.create(
      <WrappedWordList isOver={false}
                       words={words}/>
    );
    expect(wrapper).toMatchSnapshot();
  });
});


//
// Helpers
//

/**
 * Wraps a component into a DragDropContext that uses the TestBackend.
 */
function wrapInTestContext(DecoratedComponent) {
  return DragDropContext(TestBackend)(
    class TestContextContainer extends Component {
      render() {
        return <DecoratedComponent {...this.props} />;
      }
    }
  );
}
