import React from "react";
import {connect} from "react-redux";
import {fetchKeywords} from "./keyword-tagloud-action";
import {getString} from "../../app/strings";
import setPageTitle from "../../app-services/page-title";
import {isDataReady} from "../../app-services/http-request";
import {statusSelector, keywordsSelector} from "./keyword-tagloud-reducer";
import {HttpRequestStatus} from "../../app/http-request-status";
import {onMount, onUnMount} from "./keyword-tagloud-action";
import {KeywordTagCloud} from "./keyword-tagloud";


class _KeywordsViewContainer extends React.Component {

    componentDidMount() {
        setPageTitle(getString("title.keywords"));
        this.props.onMount();
        this.props.fetchData();
    }

    render() {
        if (!isDataReady(this.props.status)) {
            return (
                <HttpRequestStatus status={this.props.status}/>
            )
        } else {
            return (
                <KeywordTagCloud tags={this.props.data}/>
            )
        }
    }

    componentWillUnmount() {
        this.props.onUnMount();
    }

}

const mapStateToProps = (state, ownProps) => ({
    "status": statusSelector(state),
    "data": keywordsSelector(state)
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    "onMount": () => dispatch(onMount()),
    "onUnMount": () => dispatch(onUnMount()),
    "fetchData": () => dispatch(fetchKeywords())
});

export const KeywordsViewContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(_KeywordsViewContainer);
