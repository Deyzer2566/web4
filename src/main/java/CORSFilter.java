import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.ext.Provider;

@Provider
public class CORSFilter implements ContainerResponseFilter {
    @Override
    public void filter(ContainerRequestContext requestContext, ContainerResponseContext responseContext) {
        responseContext.getHeaders().add(
                "Access-Control-Allow-Origin", "*");
        responseContext.getHeaders().add(
                "Vary", "Origin");
//        responseContext.getHeaders().add(
//                "Access-Control-Allow-Credentials", "true");
        responseContext.getHeaders().add(
                "Access-Control-Allow-Headers",
                "origin, content-type, accept, authorization");
        responseContext.getHeaders().add(
                "Access-Control-Allow-Methods",
                "GET, POST, PUT, DELETE, OPTIONS, HEAD");

//        var exposeHeaders = "Access-Control-Allow-Headers, X-Response-UUID, Authorization, x-xsrf-token, " +
//                "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, " +
//                "Access-Control-Request-Method, Access-Control-Request-Headers, Location";
//        responseContext.getHeaders().add("Access-Control-Expose-Headers", exposeHeaders);
    }
}