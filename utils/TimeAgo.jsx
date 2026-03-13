import React from "react";
import PropTypes from "prop-types";
import ReactTimeAgo from "react-time-ago";
import ThemedText from "../components/ui/ThemedText";
import { useTheme } from "../hooks/useTheme";
import "react-time-ago/locale/en";

export default function TimeAgo(props) {
	return <ReactTimeAgo {...props} component={Time} locale="en" />;
}

function Time({ date, verboseDate, tooltip, children }) {
	return <ThemedText>{children}</ThemedText>;
}

Time.propTypes = {
	date: PropTypes.instanceOf(Date).isRequired,
	verboseDate: PropTypes.string,
	tooltip: PropTypes.bool.isRequired,
	children: PropTypes.string.isRequired,
};
