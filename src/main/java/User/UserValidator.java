package User;

public class UserValidator {
    public static boolean validateUser(String login, String password) throws BadLoginException, BadPasswordException{
        String regex = "^[a-zA-Z0-9]+$";
        if (login.contains(" ") || password.contains(" "))
            throw new BadLoginException();
        if (!login.matches(regex) || !password.matches(regex))
            throw new BadLoginException();
        if (login.length() < 6)
            throw new BadLoginException();
        if (password.length() < 6)
            throw new BadPasswordException();
        return true;
    }
}
