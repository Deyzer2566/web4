package REST;

import Database.UserBase;
import Entities.Account;
import Token.TokenManager;
import User.UserBuilder;
import User.UserValidator;

import jakarta.ejb.EJB;
import jakarta.ejb.Singleton;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import java.util.Map;
import java.util.Optional;

@Singleton
@Path("/user")
public class UserManager {

    @EJB
    UserBase userBase;
    @EJB
    TokenManager tokenManager;

    @POST
    @Path("/register")
    public Response addUser (Map<String, String> params, @Context HttpServletRequest request, @Context HttpServletResponse response) {
        Response.Status status = Response.Status.OK;
        String token = "";
        try {
            String login = params.get("login");
            String password = params.get("password");
            if (!UserValidator.validateUser(login, password))
                status = Response.Status.BAD_REQUEST;
            else {
                Account user = UserBuilder.createUser(login, password);
                if (!userBase.isUserInBase(user)) {
                    userBase.addUser(user);
                    token = tokenManager.addAccount(user);
                }
                else
                    status = Response.Status.BAD_REQUEST;
            }
        } catch (NullPointerException ex) {
            status = Response.Status.BAD_REQUEST;
        }

        return Response
                .status(status)
                .entity(token)
                .build( );
    }
    @POST
    @Path("/login")
    public Response login (Map<String, String> params, @Context HttpServletRequest request, @Context HttpServletResponse response) {
        Response.Status status = Response.Status.OK;
        String token = "";
        try {
            String login = params.get("login");
            String password = params.get("password");
            if(!UserValidator.validateUser(login, password))
                status = Response.Status.BAD_REQUEST;
            Optional<Account> account = userBase.getUser(login,password);
            if(account.isEmpty())
                status = Response.Status.BAD_REQUEST;
            else
                token = tokenManager.addAccount(account.get());
        } catch (NullPointerException e){
            status = Response.Status.BAD_REQUEST;
        }
        return Response
                .status(status)
                .entity(token)
                .build( );
    }
}
