
package br.edu.ifsp.aulawsretrofit.model;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Path;

public interface WsUserApi {

//GET

	@GET("group/{id}/users")
	Call<List<User>> groupList(@Path("id") int groupId);
    
	@GET("group/{id}/users")
	Call<List<User>> groupList(@Path("id") int groupId, @Query("sort") String sort);

//POST

	@POST("users/new")
	Call<User> createUser(@Body User user);

	@FormUrlEncoded
	@POST("user/edit")
	Call<User> updateUser(@Field("first_name") String first, @Field("last_name") String last);
  

//PUT

	@PUT("/users/{id}")
  Call<User> updateUser(@Path("id") Int userId, @Body User user);

  @Multipart
  @PUT("your-endpoint")
  Response<YourResponse> uploadFile(@Part("file") MultipartBody.Part file);

//DELETE

	@DELETE("/users/{id}")
  Call<Void> deleteUser(@Path("id") Int userId);
  
}


