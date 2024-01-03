package REST;

import Database.UserBase;
import Entities.Account;
import Token.TokenManager;
import User.BadLoginException;
import User.BadPasswordException;
import User.UserBuilder;
import User.UserValidator;

import jakarta.ejb.EJB;
import jakarta.ejb.Singleton;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
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
    @Produces(MediaType.APPLICATION_JSON)
    public Response addUser (Map<String, String> params, @Context HttpServletRequest request, @Context HttpServletResponse response) {
        String token = "";
        String login = params.get("login");
        String password = params.get("password");
        try {
            UserValidator.validateUser(login, password);
        } catch (BadLoginException e){
            return Response
                    .status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Плохой логин", ResponseErrorEnum.BAD_LOGIN))
                    .build();
        } catch (BadPasswordException e){
            return Response
                    .status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Плохой пароль", ResponseErrorEnum.BAD_PASSWORD))
                    .build();
        }
        Account user = UserBuilder.createUser(login, password);
        if (!userBase.isUserInBase(user)) {
            userBase.addUser(user);
            token = tokenManager.addAccount(user);
        }
        else {
            return Response
                    .status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Логин занят", ResponseErrorEnum.THERES_ACCOUNT_WITH_THIS_LOGIN))
                    .build();
        }
        return Response
                .status(Response.Status.OK)
                .entity(token)
                .build( );
    }
    @POST
    @Path("/login")
    @Produces(MediaType.APPLICATION_JSON)
    public Response login (Map<String, String> params, @Context HttpServletRequest request, @Context HttpServletResponse response) {
        String token = "";
        String login = params.get("login");
        String password = params.get("password");
        try {
            UserValidator.validateUser(login, password);
        } catch (BadLoginException e){
            return Response
                    .status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Плохой логин", ResponseErrorEnum.BAD_LOGIN))
                    .build();
        } catch (BadPasswordException e){
            return Response
                    .status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Плохой пароль", ResponseErrorEnum.BAD_PASSWORD))
                    .build();
        }
        Optional<Account> account = userBase.getUser(login,password);
        if(account.isEmpty()) {
            return Response
                    .status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Неверный логин или пароль", ResponseErrorEnum.BAD_LOGIN_OR_PASSWORD))
                    .build();
        }
        else {
            token = tokenManager.addAccount(account.get());
        }
        return Response
                .status(Response.Status.OK)
                .entity(token)
                .build( );
    }
}
