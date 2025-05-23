import React from "react";

type Activity =
  | "walking"
  | "running"
  | "sitting"
  | "standing"
  | "lying"
  | "upstairs"
  | "downstairs"
  | null;

interface ActivityPredictionProps {
  activity: string | null | undefined;  // renamed from currentActivity to activity
  accuracy: number;                     // in percentage
  actualActivity?: string | null | undefined;
  isSimulated?: boolean;
}

function normalizeActivity(input: string | null | undefined): Activity {
  if (!input) return null;
  const lower = input.toLowerCase();
  if (
    [
      "walking",
      "running",
      "sitting",
      "standing",
      "lying",
      "upstairs",
      "downstairs",
    ].includes(lower)
  ) {
    return lower as Activity;
  }
  return null;
}

function formatActivityLabel(activity: Activity): string {
  if (!activity) return "N/A";
  switch (activity) {
    case "upstairs":
      return "Upstairs";
    case "downstairs":
      return "Downstairs";
    default:
      return activity.charAt(0).toUpperCase() + activity.slice(1);
  }
}

const ActivityPrediction: React.FC<ActivityPredictionProps> = ({
  activity,
  accuracy,
  actualActivity,
  isSimulated = false,
}) => {
  const normalizedActivity = normalizeActivity(activity);
  const normalizedActual = normalizeActivity(actualActivity);

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-semibold mb-2">Activity Prediction</h2>

      {isSimulated ? (
        <>
          <div className="text-base mb-1">
            <span role="img" aria-label="Actual Activity" className="mr-2">
              🎯
            </span>
            <strong>Actual Activity:</strong>{" "}
            <span className="font-medium text-tech-text">
              {formatActivityLabel(normalizedActual)}
            </span>
          </div>
          <div className="text-base">
            <span role="img" aria-label="Predicted Activity" className="mr-2">
              🔮
            </span>
            <strong>Predicted Activity:</strong>{" "}
            <span className="font-medium text-tech-text">
              {formatActivityLabel(normalizedActivity)}
            </span>{" "}
            <span className="text-sm text-gray-500">({accuracy.toFixed(1)}%)</span>
          </div>
        </>
      ) : (
        <div className="text-base">
          <span role="img" aria-label="Predicted Activity" className="mr-2">
            🔮
          </span>
          <strong>Predicted Activity:</strong>{" "}
          <span className="font-medium text-tech-text">
            {formatActivityLabel(normalizedActivity)}
          </span>{" "}
          <span className="text-sm text-gray-500">({accuracy.toFixed(1)}%)</span>
        </div>
      )}
    </div>
  );
};

export default ActivityPrediction;
