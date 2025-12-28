import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.SAXParserFactory;
import javax.xml.stream.XMLInputFactory;
import javax.xml.transform.TransformerFactory;
import org.xml.sax.XMLReader;
import org.xml.sax.helpers.XMLReaderFactory;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.Unmarshaller;

public class XXEExample {

    // Vulnerable: Default DocumentBuilderFactory
    public void vulnerableDocumentBuilder(String xml) throws Exception {
        // <expect-error>
        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
        DocumentBuilder db = dbf.newDocumentBuilder();
        db.parse(new InputSource(new StringReader(xml)));
    }

    // Vulnerable: Default SAXParserFactory
    public void vulnerableSAXParser(String xml) throws Exception {
        // <expect-error>
        SAXParserFactory spf = SAXParserFactory.newInstance();
        spf.newSAXParser().parse(new InputSource(new StringReader(xml)), handler);
    }

    // Vulnerable: Default XMLInputFactory
    public void vulnerableStAX(String xml) throws Exception {
        // <expect-error>
        XMLInputFactory xif = XMLInputFactory.newInstance();
        xif.createXMLStreamReader(new StringReader(xml));
    }

    // Vulnerable: XMLReader without secure config
    public void vulnerableXMLReader(String xml) throws Exception {
        // <expect-error>
        XMLReader reader = XMLReaderFactory.createXMLReader();
        reader.parse(new InputSource(new StringReader(xml)));
    }

    // Vulnerable: TransformerFactory
    public void vulnerableTransformer(String xml) throws Exception {
        // <expect-error>
        TransformerFactory tf = TransformerFactory.newInstance();
        tf.newTransformer(new StreamSource(new StringReader(xml)));
    }

    // Vulnerable: JAXB Unmarshaller
    public void vulnerableJAXB(String xml) throws Exception {
        JAXBContext jaxbContext = JAXBContext.newInstance(MyClass.class);
        // <expect-error>
        Unmarshaller unmarshaller = jaxbContext.createUnmarshaller();
        unmarshaller.unmarshal(new StringReader(xml));
    }

    // <no-error> - Secure DocumentBuilderFactory configuration
    public void secureDocumentBuilder(String xml) throws Exception {
        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
        dbf.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        dbf.setFeature("http://xml.org/sax/features/external-general-entities", false);
        dbf.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
        dbf.setXIncludeAware(false);
        dbf.setExpandEntityReferences(false);
        DocumentBuilder db = dbf.newDocumentBuilder();
        db.parse(new InputSource(new StringReader(xml)));
    }
}
