import React, { useState, useRef, useEffect } from "react";
import { EvaluationResult, useComments } from "../../contexts/CommentsContext";
import ReactECharts from "echarts-for-react";


// Individual chart component for each comment
function CommentChart({ comment, index }: { comment: EvaluationResult, index: number }) {
  const chartRef = useRef<ReactECharts>(null);
  const [selectedContent, setSelectedContent] = useState<{
    type: 'overall' | 'feedback',
    content?: { comment: string, example_quotes: string[] }
  }>({ type: 'overall' });

  useEffect(() => {
    const chartInstance = chartRef.current?.getEchartsInstance();
    if (!chartInstance) return;

    const handleClick = (params: any) => {
      // Check for axis label clicks (corner labels)
      if (params.componentType === 'radar' && params.targetType === "axisName") {
        const clickedName = params.name;

        // Check if it's an analysis score (Overall, Neuro, Craftsmanship)
        if (['Overall', 'Neuro', 'Craftsmanship'].includes(clickedName)) {
          setSelectedContent({ type: 'overall' });
          return;
        }

        // Check if it's a feedback indicator
        const feedbackItem = comment?.feedback?.find(f => f.dimension.split("（")[0] === clickedName);
        if (feedbackItem) {
          setSelectedContent({
            type: 'feedback',
            content: {
              comment: feedbackItem.comment,
              example_quotes: feedbackItem.example_quotes
            }
          });
        } else {
          console.log('No feedback item found for:', clickedName);
        }
      }
    };

    chartInstance.on('click', handleClick);

    return () => {
      chartInstance.off('click', handleClick);
    };
  }, [comment]);

  return (
    <div className="rounded-md border p-4">
      <div className="flex flex-row">
        <RadarChartComponent
          ref={chartRef}
          comment={comment}
        />
        <div className="grow-[3] basis-[300px]">
          {/* Display content based on selection */}
          {selectedContent.type === 'overall' && comment?.overall_summary && (
            <div className="mb-4">
              <h4 className="font-medium text-sm mb-2">Overall Summary</h4>
              <p className="text-sm leading-6">{comment.overall_summary}</p>
            </div>
          )}

          {selectedContent.type === 'feedback' && selectedContent.content && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="text-sm text-gray-700 mb-2">{selectedContent.content.comment}</div>
              {selectedContent.content.example_quotes && selectedContent.content.example_quotes.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-1">示例引用:</div>
                  <ul className="text-xs text-gray-600 list-disc list-inside">
                    {selectedContent.content.example_quotes.map((quote, quoteIndex) => (
                      <li key={quoteIndex}>"{quote}"</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Radar chart component
const RadarChartComponent = React.forwardRef<ReactECharts, { comment: EvaluationResult }>(({ comment }, ref) => {
  const analysisIndicators = [
    { name: "Overall", max: 100 },
    { name: "Neuro", max: 100 },
    { name: "Craftsmanship", max: 100 },
  ];
  const feedbackIndicators = comment?.feedback?.map(f => ({
    name: f.dimension.split("（")[0],
    max: 100
  })) ?? [];

  // Combine all indicators
  const allIndicators = [...analysisIndicators, ...feedbackIndicators];

  const analysisValues = [
    comment?.analysis_score?.overall_score ?? 0,
    comment?.analysis_score?.neuro_score ?? 0,
    comment?.analysis_score?.craftsmanship_score ?? 0,
  ];
  const feedbackValues = comment?.feedback?.map(f => f.score) ?? [];

  // Create arrays that match the allIndicators order
  // Analysis values: show actual values for analysis indicators, 0 for feedback indicators
  const paddedAnalysisValues = [
    ...analysisValues,
    ...Array(feedbackIndicators.length).fill(0)
  ];

  // Feedback values: show 0 for analysis indicators, actual values for feedback indicators
  const paddedFeedbackValues = [
    ...Array(analysisIndicators.length).fill(0),
    ...feedbackValues
  ];

  const combinedOption = {
    tooltip: {
      trigger: "item",
      formatter: function (params: any) {
        const seriesName = params.data.name;
        const data = params.data;
        const indicators = allIndicators;

        let result = `<div style="font-weight: bold; margin-bottom: 5px;">${seriesName}</div>`;

        if (seriesName === "Analysis Scores") {
          // Only show analysis indicators with non-zero values
          indicators.slice(0, analysisIndicators.length).forEach((indicator, index) => {
            if (data.value[index] > 0) {
              result += `<div>${indicator.name}: ${data.value[index]}</div>`;
            }
          });
        } else if (seriesName === "Feedback Scores") {
          // Only show feedback indicators with non-zero values
          indicators.slice(analysisIndicators.length).forEach((indicator, index) => {
            const actualIndex = analysisIndicators.length + index;
            if (data.value[actualIndex] > 0) {
              result += `<div>${indicator.name}: ${data.value[actualIndex]}</div>`;
            }
          });
        }

        return result;
      }
    },
    legend: {
      show: true,
      data: ["Analysis Scores", "Feedback Scores"],
      bottom: 0
    },
    radar: {
      indicator: allIndicators,
      radius: "60%",
      splitNumber: 5,
      // Enable axis label click events
      triggerEvent: true,
      axisName: {
        show: true,
      },
      tooltip: {
        show: false
      }
    },
    series: [
      {
        type: "radar",
        data: [
          {
            value: paddedAnalysisValues,
            name: "Analysis Scores",
            areaStyle: { opacity: 0.2 },
            itemStyle: { color: "#5470c6" }
          },
          {
            value: paddedFeedbackValues,
            name: "Feedback Scores",
            areaStyle: { opacity: 0.2 },
            itemStyle: { color: "#91cc75" }
          },
        ],
      },
    ],
  } as const;

  return (
    <ReactECharts
      ref={ref}
      option={combinedOption}
      style={{ height: 300, width: "100%" }}
      className="grow-[1] basis-[350px]"
    />
  );
});

export default function Comments() {
  const { comments, getCommentsById } = useComments();
  const [activeId, setActiveId] = useState<string | null>(null);

  // Listen to dot click to focus a single evaluation by id
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ evaluationId?: string }>; 
      const id = ce?.detail?.evaluationId;
      if (id) setActiveId(id);
    };
    window.addEventListener("comment-dot-click", handler as any, true);
    return () => window.removeEventListener("comment-dot-click", handler as any, true);
  }, []);

  const list: EvaluationResult[] = activeId
    ? [getCommentsById(activeId) as EvaluationResult]
    : comments;

  return (
    <div className="flex flex-col gap-4 relative">

      {list.map((comment: EvaluationResult, index: number) => (
        <CommentChart key={comment.id ?? index} comment={comment} index={index} />
      ))}

      {/* Highlight Legend */}
      {list.length > 0 && (
        <div className="absolute right-2 bottom-2 z-1 bg-white rounded-lg border p-3 shadow-sm">
          <div className="text-sm font-medium mb-2">Highlight Legend</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 rounded" style={{ backgroundColor: "#dcfce7" }}></div>
              <span>High Score (85-100)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 rounded" style={{ backgroundColor: "#fef3c7" }}></div>
              <span>Medium Score (60-84)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 rounded" style={{ backgroundColor: "#fee2e2" }}></div>
              <span>Low Score (0-59)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const CommentContent = ({ id }: { id: string }) => {
  const { getCommentsById } = useComments();
  const comment = getCommentsById(id);
  if (!comment) return null;
  return (
    <CommentChart key={comment.id} comment={comment} index={0} />
  );
};