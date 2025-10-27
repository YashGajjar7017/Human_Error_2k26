#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(int argc, char *argv[]) {
    if (argc < 2) {
        printf("Usage: %s <typescript_file.ts>\n", argv[0]);
        return 1;
    }

    char *ts_file = argv[1];
    char js_file[256];
    strcpy(js_file, ts_file);
    char *ext = strrchr(js_file, '.');
    if (ext) {
        strcpy(ext, ".js");
    } else {
        strcat(js_file, ".js");
    }

    // Compile TypeScript to JavaScript using tsc
    char compile_cmd[512];
    sprintf(compile_cmd, "npx tsc %s --out %s", ts_file, js_file);
    int compile_result = system(compile_cmd);
    if (compile_result != 0) {
        printf("Error: TypeScript compilation failed.\n");
        return 1;
    }

    // Run the compiled JavaScript using node
    char run_cmd[512];
    sprintf(run_cmd, "node %s", js_file);
    int run_result = system(run_cmd);
    if (run_result != 0) {
        printf("Error: JavaScript execution failed.\n");
        return 1;
    }

    return 0;
}
