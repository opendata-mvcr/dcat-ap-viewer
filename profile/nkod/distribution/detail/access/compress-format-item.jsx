import React from "react";
import {PropTypes} from "prop-types"

export default function CompressFormat({tLabel, distribution}) {
  if (distribution.compressFormat === undefined) {
    return null;
  }
  return (
    <li className="list-group-item px-2">
      {tLabel(distribution.compressFormat, true)}
      <a href={distribution.compressFormat}
        rel="nofollow noopener noreferrer"
        target="_blank">
        {linkIcon()}
      </a>
    </li>
  )
}

CompressFormat.propTypes = {
  "tLabel": PropTypes.func.isRequired,
  "distribution": PropTypes.object.isRequired,
};

function linkIcon() {
  const iconStyle = {
    "fontSize": "1.2rem",
    "paddingLeft": "0.5rem",
  };
  return (
    <i className="material-icons" style={iconStyle}>
      open_in_new
    </i>
  );
}

