#include <sys/types.h>
#include <sys/wait.h>
#include <sys/resource.h>
#include <unistd.h>
#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <cstring>
#include <cstdlib>

// Simple code runner tool for C/C++: compile and run with resource limits
// Usage: code_runner compile path/to/source.c -o out
//        code_runner run path/to/exe

int set_limits(int cpu_seconds, size_t memory_bytes) {
    struct rlimit rl;
    rl.rlim_cur = rl.rlim_max = cpu_seconds;
    if (setrlimit(RLIMIT_CPU, &rl) != 0) return -1;

    rl.rlim_cur = rl.rlim_max = memory_bytes;
    if (setrlimit(RLIMIT_AS, &rl) != 0) return -1;

    return 0;
}

int run_executable(const std::string &exePath, int timeoutSec) {
    pid_t pid = fork();
    if (pid == -1) return -1;
    if (pid == 0) {
        // child
        // set limits: CPU 2s, address space 256MB
        set_limits(timeoutSec, 256UL * 1024 * 1024);
        execl(exePath.c_str(), exePath.c_str(), (char*)NULL);
        _exit(127);
    } else {
        int status = 0;
        int elapsed = 0;
        while (true) {
            pid_t r = waitpid(pid, &status, WNOHANG);
            if (r == pid) break;
            sleep(1);
            elapsed +=1;
            if (elapsed >= timeoutSec) {
                kill(pid, SIGKILL);
                waitpid(pid, &status, 0);
                std::cerr << "TIMEOUT" << std::endl;
                return 124; // common timeout code
            }
        }
        if (WIFEXITED(status)) return WEXITSTATUS(status);
        return 0;
    }
}

int compile_source(const std::string &srcPath, const std::string &outPath, bool isCpp) {
    std::string compiler = isCpp ? "g++" : "gcc";
    std::string cmd = compiler + " -O2 \"" + srcPath + "\" -o \"" + outPath + "\" 2>&1";
    std::cerr << "Running compile: " << cmd << std::endl;
    int rc = system((cmd + " > compile_output.txt 2>&1").c_str());
    // read compile_output
    std::ifstream ifs("compile_output.txt");
    std::string out((std::istreambuf_iterator<char>(ifs)), std::istreambuf_iterator<char>());
    std::cout << out << std::endl;
    return rc;
}

int main(int argc, char** argv) {
    if (argc < 3) {
        std::cerr << "Usage: code_runner <compile|run> args...\n";
        return 1;
    }

    std::string action = argv[1];
    if (action == "compile") {
        std::string src = argv[2];
        std::string out = argc > 3 ? argv[3] : "a.out";
        bool isCpp = src.size() > 4 && src.substr(src.size()-4) == ".cpp";
        int rc = compile_source(src, out, isCpp);
        return rc;
    } else if (action == "run") {
        std::string exe = argv[2];
        int rc = run_executable(exe, 5);
        return rc;
    }

    std::cerr << "Unknown action" << std::endl;
    return 2;
}
