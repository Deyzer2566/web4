package REST;

import java.io.Serializable;

public class ErrorResponse implements Serializable {
    private String description;
    private ResponseErrorEnum code;

    public ErrorResponse(String description, ResponseErrorEnum code) {
        this.description = description;
        this.code = code;
    }

    public ErrorResponse() {
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ResponseErrorEnum getCode() {
        return code;
    }

    public void setCode(ResponseErrorEnum code) {
        this.code = code;
    }
}
