import java.io.IOException;

public class RuntimeExecTest {

    // Vulnerable: Runtime.exec with string concatenation
    public void vulnerableConcat(String userInput) throws IOException {
        // <expect-error>
        Runtime.getRuntime().exec("ping " + userInput);
    }

    // Vulnerable: Runtime.exec with multiple concatenations
    public void vulnerableMultipleConcat(String host, String port) throws IOException {
        // <expect-error>
        Runtime.getRuntime().exec("nc " + host + " " + port);
    }

    // Vulnerable: Variable holding Runtime reference
    public void vulnerableWithVariable(String cmd) throws IOException {
        Runtime runtime = Runtime.getRuntime();
        // <expect-error>
        runtime.exec("ls " + cmd);
    }

    // Vulnerable: Complex concatenation
    public void vulnerableComplexConcat(String filename) throws IOException {
        String baseCmd = "cat ";
        // <expect-error>
        Runtime.getRuntime().exec(baseCmd + filename);
    }

    // <no-error> - Static string literal
    public void safeStaticCommand() throws IOException {
        Runtime.getRuntime().exec("ls -la");
    }

    // <no-error> - Using array of arguments
    public void safeArrayArguments(String validatedIp) throws IOException {
        Runtime.getRuntime().exec(new String[]{"ping", "-c", "4", validatedIp});
    }

    // <no-error> - Using ProcessBuilder (safe)
    public void safeProcessBuilder(String validatedIp) throws IOException {
        ProcessBuilder pb = new ProcessBuilder("ping", "-c", "4", validatedIp);
        pb.start();
    }

    // <no-error> - Variable reference only (not concatenation)
    public void safeVariableRef(String[] command) throws IOException {
        Runtime.getRuntime().exec(command);
    }
}
