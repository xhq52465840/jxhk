
package com.juneyaoair.sms;

import javax.xml.bind.annotation.XmlRegistry;


/**
 * This object contains factory methods for each 
 * Java content interface and Java element interface 
 * generated in the com.juneyaoair.sms package. 
 * <p>An ObjectFactory allows you to programatically 
 * construct new instances of the Java representation 
 * for XML content. The Java representation of XML 
 * content can consist of schema derived interfaces 
 * and classes representing the binding of schema 
 * type definitions, element declarations and model 
 * groups.  Factory methods for each of these are 
 * provided in this class.
 * 
 */
@XmlRegistry
public class ObjectFactory {


    /**
     * Create a new ObjectFactory that can be used to create new instances of schema derived classes for package: com.juneyaoair.sms
     * 
     */
    public ObjectFactory() {
    }

    /**
     * Create an instance of {@link SendSmResponse }
     * 
     */
    public SendSmResponse createSendSmResponse() {
        return new SendSmResponse();
    }

    /**
     * Create an instance of {@link ReceiveSmResponse }
     * 
     */
    public ReceiveSmResponse createReceiveSmResponse() {
        return new ReceiveSmResponse();
    }

    /**
     * Create an instance of {@link ArrayOfSmsMessageRev }
     * 
     */
    public ArrayOfSmsMessageRev createArrayOfSmsMessageRev() {
        return new ArrayOfSmsMessageRev();
    }

    /**
     * Create an instance of {@link SendSm }
     * 
     */
    public SendSm createSendSm() {
        return new SendSm();
    }

    /**
     * Create an instance of {@link SendSmExt }
     * 
     */
    public SendSmExt createSendSmExt() {
        return new SendSmExt();
    }

    /**
     * Create an instance of {@link ReceiveSmExt }
     * 
     */
    public ReceiveSmExt createReceiveSmExt() {
        return new ReceiveSmExt();
    }

    /**
     * Create an instance of {@link ReceiveSmExtResponse }
     * 
     */
    public ReceiveSmExtResponse createReceiveSmExtResponse() {
        return new ReceiveSmExtResponse();
    }

    /**
     * Create an instance of {@link ReceiveSm }
     * 
     */
    public ReceiveSm createReceiveSm() {
        return new ReceiveSm();
    }

    /**
     * Create an instance of {@link SendSmExtResponse }
     * 
     */
    public SendSmExtResponse createSendSmExtResponse() {
        return new SendSmExtResponse();
    }

    /**
     * Create an instance of {@link SmsMessageRev }
     * 
     */
    public SmsMessageRev createSmsMessageRev() {
        return new SmsMessageRev();
    }

}
