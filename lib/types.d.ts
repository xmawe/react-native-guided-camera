export interface VideoData {
    uri: string;
    duration?: number;
    size?: number;
}
export type SupportedLanguage = "english" | "arabic" | "french";
export interface GuidedCameraViewProps {
    onCameraClose?: () => void;
    onScreen?: boolean;
    terminalLogs?: boolean;
    onVideoSave?: (videoData: VideoData) => void;
    language?: SupportedLanguage;
}
//# sourceMappingURL=types.d.ts.map