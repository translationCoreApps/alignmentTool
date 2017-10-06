import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
// constants
import ItemTypes from '../ItemTypes';
// components
import BottomWordCard from './BottomWordCard';
import TopWordCard from './TopWordCard';

class DropBoxItem extends Component {
  render() {
    const { alignmentIndex, canDrop, isOver, bottomWords, connectDropTarget, topWords } = this.props;
    const topStyle = {
      padding: topWords.length === 0 ? '15px 0px' : '1px 0'
    };
    const bottomStyle = {
      height: '35px',
      padding: bottomWords.length === 0 ? '15px 0px' : canDrop ? '15px 0px' :'0px',
      border: isOver && canDrop ? '3px dashed #44C6FF' : bottomWords.length === 0 ? '3px dashed #ffffff' : canDrop ? '3px dashed #ffffff' : ''
    };

    return connectDropTarget(
      <div style={{ padding: '5px 10px', backgroundColor: '#DCDCDC', margin: '0px 10px 10px 0px', height: '100px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', width: '230px', height: '70px', backgroundColor: '#DCDCDC' }}>
          <div style={topStyle}>
            <div style={{ display: 'flex' }}>
              {
                topWords.map((wordObject, index) => (
                  <TopWordCard
                    key={index}
                    wordObject={wordObject}
                    alignmentIndex={this.props.alignmentIndex}
                    resourcesReducer={this.props.resourcesReducer}
                    actions={this.props.actions}
                  />
                ))
              }
            </div>
          </div>
          <div style={bottomStyle}>
            {bottomWords.length > 0 &&
              <div style={{ display: 'flex' }}>
                {
                  bottomWords.map((metadata, index) => (
                    <BottomWordCard
                      key={index}
                      word={metadata.word}
                      occurrence={metadata.occurrence}
                      occurrences={metadata.occurrences}
                      alignmentIndex={alignmentIndex}
                    />
                  ))
                }
              </div>
            }
          </div>
        </div>
      </div>
    );
  }
}

DropBoxItem.propTypes = {
  isOver: PropTypes.bool.isRequired,
  canDrop: PropTypes.bool.isRequired,
  draggingColor: PropTypes.string,
  connectDropTarget: PropTypes.func.isRequired,
  topWords: PropTypes.array.isRequired,
  bottomWords: PropTypes.array.isRequired,
  alignmentIndex: PropTypes.number.isRequired,
  lastDroppedItem: PropTypes.object,
  onDrop: PropTypes.func.isRequired,
  resourcesReducer: PropTypes.shape({
    lexicons: PropTypes.object.isRequired
  }),
  actions: PropTypes.shape({
    showPopover: PropTypes.func.isRequired,
    loadLexiconEntry: PropTypes.func.isRequired
  })
};

const DropDropBoxItemAction = {
  canDrop(props, monitor) {
    const item = monitor.getItem();
    let canDrop;
    if (item.type === ItemTypes.BOTTOM_WORD) {
      const alignmentIndexDelta = props.alignmentIndex - item.alignmentIndex;
      canDrop = alignmentIndexDelta !== 0;
      return canDrop;
    }
    if (item.type === ItemTypes.TOP_WORD) {
      if (props.topWords.length === 0 && props.bottomWords.length === 0) {
        canDrop = true;
      } else {
        const alignmentIndexDelta = props.alignmentIndex - item.alignmentIndex;
        canDrop = (Math.abs(alignmentIndexDelta) === 1);
      }
      return canDrop;
    }
  },
  drop(props, monitor) {
    props.onDrop(monitor.getItem());
  }
};

const collect = (connect, monitor) => {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  };
};

export default DropTarget(
  [ItemTypes.BOTTOM_WORD, ItemTypes.TOP_WORD], // itemType
  DropDropBoxItemAction,
  collect
)(DropBoxItem);
