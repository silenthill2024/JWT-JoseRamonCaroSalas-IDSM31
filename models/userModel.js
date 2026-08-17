
class userModel {
    static findByCredentials(username, password) {
        const users= [  
        {username:"admin", password:"admin123",role:"admin",
         username:"jose",password:"jose123",role:"user",
         username:"david",password:"david123",role:"user"
        }
           ];
        // Implementation for finding user by credentials
        return users.find(user=>
            user.username===username&& user.password===password
        )
    }
}
module.exports=userModel;