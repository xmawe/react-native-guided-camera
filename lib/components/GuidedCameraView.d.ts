import React from "react";
import { VideoData, SupportedLanguage } from "../types";
interface GuidedCameraViewProps {
    onCameraClose?: () => void;
    onScreen?: boolean;
    terminalLogs?: boolean;
    onVideoSave?: (videoData: VideoData) => void;
    language?: SupportedLanguage;
    metricsUpdateInterval?: number;
    includeSeverityLevels?: ('info' | 'warning' | 'error')[];
}
declare const GuidedCameraView: React.FC<GuidedCameraViewProps>;
export default GuidedCameraView;
//# sourceMappingURL=GuidedCameraView.d.ts.map