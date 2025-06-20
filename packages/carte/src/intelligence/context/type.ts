export type ModelContextCell = {
    title: string;
    body: ModelContextCellBody;
};

export type ModelContextCellBody =
    | ModelContextCell_FileTree
    | ModelContextCell_FullFile
    | ModelContextCell_FileScaffold
    | ModelContextCell_UserRequest
    | ModelContextCell_IncludedPrompt
    | ModelContextCell_NearbyFullFiles
    | ModelContextCell_NearbyFileScaffolds
    | ModelContextCell_Section
    | ModelContextCell_CommandFiles;

export interface ModelContextCell_FileTree {
    type: "file-tree";
    rootDirPath: string;
}

export interface ModelContextCell_FullFile {
    type: "file-content";
    filePath: string;
}

export interface ModelContextCell_FileScaffold {
    type: "file-scaffold";
    filePath: string;
}

export interface ModelContextCell_NearbyFullFiles {
    type: "nearby-full-files";
    filePath: string;
    count: number;
}

export interface ModelContextCell_NearbyFileScaffolds {
    type: "nearby-file-scaffolds";
    filePath: string;
    count: number;
}

export interface ModelContextCell_UserRequest {
    type: "user-request";
    request: string;
}

export interface ModelContextCell_IncludedPrompt {
    type: "included-prompt";
    promptName: string;
}

export interface ModelContextCell_Section {
    type: "section";
    title: string;
    description: string;
}

export interface ModelContextCell_CommandFiles {
    type: "command-files";
    filePath: string;
    command: string;
    count: number;
}
