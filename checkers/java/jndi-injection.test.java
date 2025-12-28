import javax.naming.InitialContext;
import javax.naming.Context;
import javax.naming.NamingException;

public class JNDIInjectionTest {

    // Vulnerable: lookup with variable
    public void vulnerableLookup(String userInput) throws NamingException {
        InitialContext ctx = new InitialContext();
        // <expect-error>
        ctx.lookup(userInput);
    }

    // Vulnerable: lookup with concatenation
    public void vulnerableConcat(String resource) throws NamingException {
        Context context = new InitialContext();
        // <expect-error>
        context.lookup("java:comp/env/" + resource);
    }

    // Vulnerable: inline context creation
    public void vulnerableInline(String jndiName) throws NamingException {
        // <expect-error>
        new InitialContext().lookup(jndiName);
    }

    // Vulnerable: lookup with method call result
    public void vulnerableMethodResult() throws NamingException {
        InitialContext ic = new InitialContext();
        // <expect-error>
        ic.lookup(getResourceName());
    }

    private String getResourceName() {
        return "dynamic";
    }

    // <no-error> - Static string literal
    public void safeLookup() throws NamingException {
        InitialContext ctx = new InitialContext();
        ctx.lookup("java:comp/env/jdbc/myDB");
    }

    // <no-error> - Constant from allowlist
    private static final String DB_JNDI = "java:comp/env/jdbc/myDB";

    public void safeConstantLookup() throws NamingException {
        InitialContext ctx = new InitialContext();
        ctx.lookup(DB_JNDI);
    }
}
