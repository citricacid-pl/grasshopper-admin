define(['api', 'resources', 'UserModel', 'backbone'],
    function (api, resources, UserModel, Backbone) {
        'use strict';

        return {
            getCurrentUserDetails : getCurrentUserDetails,
            isValidProfileEditor : isValidProfileEditor,
            getRequestedUserDetails : getRequestedUserDetails,
            getMyUserDetails : getMyUserDetails,
            isThisMyProfile : isThisMyProfile,
            getProfileData : getProfileData,
            getUsers : getUsers,
            saveUser : saveUser
        };

        function getCurrentUserDetails (UserModel) {
            if (localStorage.authToken) {
                api.authenticateToken()
                    .done(function (data) {
                        UserModel.set({
                            _id : data._id,
                            email : data.email,
                            enabled : data.enabled,
                            login : data.login,
                            name : data.name,
                            password : data.password,
                            role : data.role
                        });

                    })
                    .fail(function (xhr) {
                        // TODO: Error handling for this. Getting of the current users details.
                    });
            }
        }

        //THIS IS NOT YET IMPLEMENTED NEEDS TO BE FINISHED WHEN THERE ARE METHODS PRESENT TO SAVE A USER
        function saveUser() {
            console.log('saving User');
        }
        /**
         *  Runner method for getting user details.
         *  Decides if you are a user accessing your own account, or if you are an admin accessing someone else's.
         */
        function getProfileData(UserModel, id) {
            if (isThisMyProfile(UserModel, id)) {
                return getMyUserDetails();
            } else if (isValidProfileEditor(UserModel)) {
                return getRequestedUserDetails(id);
            }
        }

        // TODO: make this computed property too
        function isValidProfileEditor(UserModel) {
            // Check if the user trying to access the profile is either an administrator or the current user
            return (UserModel.get('role') === resources.user.roles.admin);
        }

        function isThisMyProfile(UserModel, id) {
            return (UserModel.get('id') === id);
        }

        function getRequestedUserDetails (id) {
            return api.getRequestedUserDetails(id);
        }

        function getMyUserDetails () {
            return api.getMyUserDetails();
        }

        function getUsers (view) {
            // TODO: implement this and override fetch using adapter:
//            new UserCollection().fetch().done(function() {
//                console.log('----- done');
//                view.model.set({
//                    users : UserCollection.models,
//                    usersCollection : UserCollection
//                });
//            }).fail(function() {
//                    console.log('------ fail');
//                });
            api.getUsers()
                .done(function(data){

                    var UserCollection = new Backbone.Collection([],{
                        model: UserModel
                    });
                    UserCollection.add(data.results);
                    view.model.set({
                        users : UserCollection.models,
                        usersCollection : UserCollection
                    });
                })
                .fail(function(xhr){
                    view.displayAlertBox(xhr);
                });

        }

    });