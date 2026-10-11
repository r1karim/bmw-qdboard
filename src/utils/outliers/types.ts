/**
 * Defines the supported outlier detection metrics.
 *
 * - "resolution": Identifies unusually long defect resolution durations.
 * - "vin": Identifies vehicles with unusually high defect report counts.
 * - "severity": Identifies reports meeting the configured severity threshold.
 */
export type OutlierMetric = "resolution" | "vin" | "severity";

// Import and re-export the shared Defect type for use by detection modules.
import type { Defect } from "../dashboardAnalytics";
export type { Defect };

/**
 * Represents a single observation used in outlier detection.
 *
 * Provides a common structure for defect-related observations,
 * regardless of the selected detection metric.
 *
 * @property id - Unique identifier associated with the observation.
 * @property label - Human-readable label used in tables and charts.
 * @property value - Numeric value evaluated by the detection algorithm.
 * @property date - Report date associated with the observation.
 * @property vin - Optional vehicle identification number.
 * @property station - Optional production station associated with the report.
 * @property status - Optional resolution status of the defect report.
 */
export type OutlierItem = {
    id: string;
    label: string;
    value: number;
    date: string;
    vin?: string;
    station?: string;
    status?: string;
};

/**
 * Represents the complete results of an outlier detection analysis.
 *
 * Contains the selected metric, applied detection threshold,
 * statistical information, observation counts, and flagged items.
 *
 * The quartile and IQR fields are primarily relevant to
 * resolution-time analysis. Other detection methods may
 * return zero for these values.
 *
 * @property metric - Detection metric used to perform the analysis.
 * @property threshold - Threshold used to identify outliers.
 * @property q1 - First quartile of the baseline distribution.
 * @property q3 - Third quartile of the baseline distribution.
 * @property iqr - Interquartile range, calculated as Q3 minus Q1.
 * @property total - Total number of valid observations analyzed.
 * @property flaggedCount - Number of observations identified as outliers.
 * @property flaggedShare - Percentage of valid observations flagged as outliers.
 * @property flagged - Collection of observations identified as outliers.
 */
export type OutlierResult = {
    metric: OutlierMetric;
    threshold: number;
    q1: number;
    q3: number;
    iqr: number;
    total: number;
    flaggedCount: number;
    flaggedShare: number;
    flagged: OutlierItem[];
};