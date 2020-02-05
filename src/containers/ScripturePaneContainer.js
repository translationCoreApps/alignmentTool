import React from 'react';
import PropTypes from 'prop-types';
import { ScripturePane } from 'tc-ui-toolkit';
import { getAvailableScripturePaneSelections } from '../utils/resourcesHelpers';

/**
 * Injects necessary data into the scripture pane.
 * @param props
 * @return {*}
 * @constructor
 */
const ScripturePaneContainer = (props) => {
  const {
    tc: {
      settingsReducer: { toolsSettings },
      resourcesReducer: { bibles },
      selectionsReducer: { selections },
      contextId,
      projectDetailsReducer,
      showPopover,
      getLexiconData,
      setToolSettings,
      editTargetVerse,// TODO: Create a local version using the tools redux implementation.
      makeSureBiblesLoadedForTool,
    },
    translate,
    handleModalOpen,
  } = props;

  const currentPaneSettings = (toolsSettings && toolsSettings.ScripturePane)
    ? toolsSettings.ScripturePane.currentPaneSettings
    : [];

  // build the title
  const { target_language, project } = projectDetailsReducer.manifest;
  let expandedScripturePaneTitle = project.name;

  if (target_language && target_language.book && target_language.book.name) {
    expandedScripturePaneTitle = target_language.book.name;
  }

  if (Object.keys(bibles).length > 0) {
    return (
      <ScripturePane
        currentPaneSettings={currentPaneSettings}
        contextId={contextId}
        bibles={bibles}
        expandedScripturePaneTitle={expandedScripturePaneTitle}
        showPopover={showPopover}
        editTargetVerse={editTargetVerse}
        projectDetailsReducer={projectDetailsReducer}
        translate={translate}
        getLexiconData={getLexiconData}
        selections={selections}
        setToolSettings={setToolSettings}
        getAvailableScripturePaneSelections={(resourceList) => {
          getAvailableScripturePaneSelections(resourceList, contextId, bibles);
        }}
        makeSureBiblesLoadedForTool={makeSureBiblesLoadedForTool}
        handleModalOpen={handleModalOpen}
      />
    );
  } else {
    return <div/>;
  }
};

ScripturePaneContainer.propTypes = {
  translate: PropTypes.func.isRequired,
  tc: PropTypes.shape({
    settingsReducer: PropTypes.object.isRequired,
    resourcesReducer: PropTypes.object.isRequired,
    selectionsReducer: PropTypes.object.isRequired,
    contextId: PropTypes.object.isRequired,
    projectDetailsReducer: PropTypes.object.isRequired,
    showPopover: PropTypes.func.isRequired,
    editTargetVerse: PropTypes.func.isRequired,
    getLexiconData: PropTypes.func.isRequired,
    setToolSettings: PropTypes.func.isRequired,
    getAvailableScripturePaneSelections: PropTypes.func.isRequired,
    makeSureBiblesLoadedForTool: PropTypes.func.isRequired,
  }).isRequired,
  handleModalOpen: PropTypes.func,
};

ScripturePaneContainer.defaultProps = { handleModalOpen: () => {} };

export default ScripturePaneContainer;
