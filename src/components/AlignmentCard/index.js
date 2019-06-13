import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {DropTarget} from 'react-dnd';
import * as types from '../WordCard/Types';
import SecondaryToken from '../SecondaryToken';
import PrimaryToken from '../PrimaryToken';
import AlignmentCard from './AlignmentCard';
import {Token} from 'wordmap-lexer';

const styles = {
  root: {
    open: {
      width: 'auto',
      display: 'inherit',
      transition: '0.5s'
    },
    closed: {
      width: '0',
      display: 'none',
      transition: '0.5s'
    }
  }
};

/**
 * Determines if a word can be dropped
 * @param dropTargetProps
 * @param dragSourceProps
 * @return {boolean}
 */
export const canDropPrimaryToken = (dropTargetProps, dragSourceProps) => {
  const emptyTarget = dropTargetProps.sourceNgram.length === 0;
  const singleTarget = dropTargetProps.sourceNgram.length === 1;
  const mergedTarget = dropTargetProps.sourceNgram.length > 1;
  const singleSource  = dragSourceProps.alignmentLength === 1;
  const mergedSource = dragSourceProps.alignmentLength > 1;
  const alignmentDelta = dropTargetProps.alignmentIndex - dragSourceProps.alignmentIndex;
  // const leftPlaceholder = dropTargetProps.placeholderPosition === 'left';  //alignmentDelta < 0;
  // const rightPlaceholder = dropTargetProps.placeholderPosition === 'right'; //alignmentDelta > 0;
  const different = alignmentDelta !== 0;
  // const leftWord = mergedSource && dragSourceProps.wordIndex === 0;
  // const rightWord = mergedSource && dragSourceProps.wordIndex === dragSourceProps.alignmentLength - 1;

  const source = dragSourceProps.token && dragSourceProps.token.text || '';
  const dest = dropTargetProps.sourceNgram && dropTargetProps.sourceNgram.length && dropTargetProps.sourceNgram[0] && dropTargetProps.sourceNgram[0].text || '';
  console.log(`canDropPrimaryToken() - from '${source}' to '${dest}'`, {emptyTarget, singleTarget, mergedTarget, singleSource, mergedSource, alignmentDelta, different});

  // limit all drags from merged source to adjacent alignments
  // const nonAdjacent = Math.abs(alignmentDelta) > 1;
  // if(mergedSource && nonAdjacent) { // if these primary tokens are not next to each other, skip
  //   console.log("canDropPrimaryToken() - merged source not adjacent - false");
  //   return false;
  // }

  // single to single
  // TRICKY: make sure we've moved
  if(singleSource && singleTarget && different) {
    console.log("canDropPrimaryToken() - single to different single - true");
    return true;
  }

  // single to merged group
  if(singleSource && mergedTarget) {
    console.log("canDropPrimaryToken() - single to merged group - true");
    return true;
  }

  
  if(mergedSource) {
    if (emptyTarget) { // merged group to empty
      if (!different) { // if unmerge target for this group
        console.log("canDropPrimaryToken() - merged group to unmerge target - true");
        return true;
      }
    } else if (singleTarget) { // merged group to single
      console.log("canDropPrimaryToken() - merged group to single - true");
      return true;
    } else if (mergedTarget && different) { // merged group to different merged group
      console.log("canDropPrimaryToken() - merged group to different merged group - true");
      return true;
    }
    
    // TODO: need a workaround for this bug before supporting left vs right un-merging https://github.com/react-dnd/react-dnd/issues/735
    // see components/AlignmentGrid.js
    // we could potentially use the touch backend https://github.com/yahoo/react-dnd-touch-backend
    // however that would require us to render a custom drag preview and the drag performance may
    // not be as good.
    // if(!moved && leftPlaceholder && leftWord) return true;
    // if(!moved && rightPlaceholder && rightWord) return true;
  }

  console.log("canDropPrimaryToken() - default, false");
  return false;
};


/**
 * Renders the alignment of primary and secondary words/phrases
 */
class DroppableAlignmentCard extends Component {
  constructor(props) {
    super(props);
    this._handleCancelSuggestion = this._handleCancelSuggestion.bind(this);
    this._handleAcceptSuggestion = this._handleAcceptSuggestion.bind(this);
  }

  _handleCancelSuggestion(token) {
    const {onCancelTokenSuggestion, alignmentIndex} = this.props;
    if(typeof onCancelTokenSuggestion === 'function') {
      onCancelTokenSuggestion(alignmentIndex, token);
    }
  }

  _handleAcceptSuggestion(token) {
    const {onAcceptTokenSuggestion, alignmentIndex} = this.props;
    if(typeof onAcceptTokenSuggestion === 'function') {
      onAcceptTokenSuggestion(alignmentIndex, token);
    }
  }

  render() {
    const {
      translate,
      lexicons,
      canDrop,
      dragItemType,
      isOver,
      actions,
      targetNgram,
      sourceNgram,
      alignmentIndex,
      sourceStyle,
      sourceDirection,
      targetDirection,
      isSuggestion,
      connectDropTarget
    } = this.props;

    const acceptsTop = canDrop && dragItemType === types.PRIMARY_WORD;
    const acceptsBottom = canDrop && dragItemType === types.SECONDARY_WORD;

    const hoverTop = isOver && acceptsTop;
    const hoverBottom = isOver && acceptsBottom;

    const emptyAlignment = sourceNgram.length === 0 && targetNgram.length === 0;

    const topWordCards = sourceNgram.map((token, index) => (
      <PrimaryToken
        key={index}
        style={sourceStyle}
        translate={translate}
        direction={sourceDirection}
        wordIndex={index}
        alignmentLength={sourceNgram.length}
        token={token}
        alignmentIndex={alignmentIndex}
        lexicons={lexicons}
        actions={actions}
      />
    ));
    const bottomWordCards = targetNgram.map((token, index) => (
      <SecondaryToken
        key={index}
        token={token}
        direction={targetDirection}
        onCancel={this._handleCancelSuggestion}
        onAccept={this._handleAcceptSuggestion}
        alignmentIndex={alignmentIndex}
      />
    ));

    if (emptyAlignment && !canDrop) {
      return <div style={styles.root.closed}/>;
    } else {
      return connectDropTarget(
        <div>
          <AlignmentCard targetTokenCards={bottomWordCards}
                         targetDirection={targetDirection}
                         hoverBottom={hoverBottom}
                         hoverTop={hoverTop}
                         isSuggestion={isSuggestion}
                         acceptsTargetTokens={acceptsBottom}
                         acceptsSourceTokens={acceptsTop}
                         sourceTokenCards={topWordCards}/>
        </div>
      );
    }
  }
}

DroppableAlignmentCard.propTypes = {
  onCancelTokenSuggestion: PropTypes.func,
  onAcceptTokenSuggestion: PropTypes.func,
  translate: PropTypes.func.isRequired,
  placeholderPosition: PropTypes.string,
  sourceStyle: PropTypes.object.isRequired,
  dragItemType: PropTypes.string,
  isOver: PropTypes.bool.isRequired,
  canDrop: PropTypes.bool.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  sourceNgram: PropTypes.arrayOf(PropTypes.instanceOf(Token)).isRequired,
  targetNgram: PropTypes.arrayOf(PropTypes.instanceOf(Token)).isRequired,
  alignmentIndex: PropTypes.number.isRequired,
  isSuggestion: PropTypes.bool.isRequired,
  onDrop: PropTypes.func.isRequired,
  lexicons: PropTypes.object.isRequired,
  sourceDirection: PropTypes.oneOf(['ltr', 'rtl']),
  targetDirection: PropTypes.oneOf(['ltr', 'trl']),
  actions: PropTypes.shape({
    showPopover: PropTypes.func.isRequired,
    loadLexiconEntry: PropTypes.func.isRequired
  })
};

DroppableAlignmentCard.defaultProps = {
  sourceDirection: 'ltr',
  targetDirection: 'ltr',
  sourceStyle: {fontSize: "100%"},
};

const dragHandler = {
  canDrop(props, monitor) {
    const item = monitor.getItem();
    const alignmentEmpty = (props.sourceNgram.length === 0 &&
      props.targetNgram.length === 0);
    let canDrop = false;
    if (item.type === types.SECONDARY_WORD) {
      if(item.alignmentIndex === undefined) {
        // TRICKY: tokens from the word list will not have an alignment
        canDrop = !alignmentEmpty;
      } else {
        const alignmentPositionDelta = props.alignmentIndex - item.alignmentIndex;
        canDrop = alignmentPositionDelta !== 0 && !alignmentEmpty;
      }
      return canDrop;
    }
    if (item.type === types.PRIMARY_WORD) {
      return canDropPrimaryToken(props, item);
    }
  },
  drop(props, monitor) {
    props.onDrop(monitor.getItem());
  }
};

const collect = (connect, monitor) => {
  const item = monitor.getItem();
  return {
    connectDropTarget: connect.dropTarget(),
    dragItemType: item ? item.type : null,
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  };
};

export default DropTarget(
  [types.SECONDARY_WORD, types.PRIMARY_WORD],
  dragHandler,
  collect
)(DroppableAlignmentCard);
