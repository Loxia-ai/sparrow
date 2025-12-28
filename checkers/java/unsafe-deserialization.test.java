import java.io.*;
import java.util.Set;

public class DeserializationTest {

    // Vulnerable: Direct ObjectInputStream usage
    public Object vulnerableDeserialize(byte[] data) throws Exception {
        ByteArrayInputStream bis = new ByteArrayInputStream(data);
        // <expect-error>
        ObjectInputStream ois = new ObjectInputStream(bis);
        // <expect-error>
        return ois.readObject();
    }

    // Vulnerable: Deserialize from file
    public Object vulnerableFileDeserialize(String path) throws Exception {
        FileInputStream fis = new FileInputStream(path);
        // <expect-error>
        ObjectInputStream input = new ObjectInputStream(fis);
        // <expect-error>
        return input.readObject();
    }

    // <no-error> - Using JSON instead
    public Object safeJsonDeserialize(String json) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        return mapper.readValue(json, UserDTO.class);
    }

    // <no-error> - SafeObjectInputStream with whitelist
    public Object safeDeserialize(byte[] data) throws Exception {
        ByteArrayInputStream bis = new ByteArrayInputStream(data);
        SafeObjectInputStream sois = new SafeObjectInputStream(bis, ALLOWED);
        return sois.readObject();
    }
}

// Safe implementation with whitelist
class SafeObjectInputStream extends ObjectInputStream {
    private final Set<String> allowedClasses;

    public SafeObjectInputStream(InputStream in, Set<String> allowed)
            throws IOException {
        super(in);
        this.allowedClasses = allowed;
    }

    @Override
    protected Class<?> resolveClass(ObjectStreamClass desc)
            throws IOException, ClassNotFoundException {
        if (!allowedClasses.contains(desc.getName())) {
            throw new InvalidClassException("Unauthorized class");
        }
        return super.resolveClass(desc);
    }
}
