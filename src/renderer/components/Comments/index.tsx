import { EvaluationResult, useComments } from "../../contexts/CommentsContext";
import ReactECharts from "echarts-for-react";


export default function Comments() {
  const { comments } = useComments();
  return (
    <div className="flex flex-col gap-4">
      {comments.map((comment: EvaluationResult, index: number) => {
        const indicators = [
          { name: "Overall", max: 100 },
          { name: "Neuro", max: 100 },
          { name: "Craftsmanship", max: 100 },
        ];
        const values = [
          comment?.analysis_score?.overall_score ?? 0,
          comment?.analysis_score?.neuro_score ?? 0,
          comment?.analysis_score?.craftsmanship_score ?? 0,
        ];
        const option = {
          tooltip: { trigger: "item" },
          legend: { show: false },
          radar: {
            indicator: indicators,
            radius: "60%",
            splitNumber: 5,
          },
          series: [
            {
              type: "radar",
              data: [
                {
                  value: values,
                  name: "Scores",
                  areaStyle: { opacity: 0.2 },
                },
              ],
            },
          ],
        } as const;
        return (
          <div key={index} className="rounded-md border p-4">
            <div className="mb-2 text-sm text-muted-foreground">Evaluation #{index + 1}</div>
            <ReactECharts option={option} style={{ height: 260, width: "100%" }} />
            {comment?.overall_summary ? (
              <p className="mt-2 text-sm leading-6">{comment.overall_summary}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}