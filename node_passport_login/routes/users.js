const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

const User = require('../models/User');

router.get('/login',(req,res) => res.render('login'));
router.get('/register',(req,res) => res.render('register'));

router.post('/register',(req,res)=>{
const {name,email,password,password2} = req.body;

let errors = [];

if(!name|| !email || !password || !password2){
    errors.push({ msg: 'Please fill in all fields.'});
}

if(password!=password2){
    errors.push({msg: 'Passwords do not match.'});
}

if(password.length < 6){
    errors.push({msg: 'Password should be atleast 6 characters.'});
}

if(errors.length > 0){
    res.render('register',{
        errors,
        name,
        email,
        password,
        password2
    });
}
else {
    User.findOne({email:email})
    .then(user => {
     if(user) {  
         errors.push({msg: 'Email is already registered.'});
        res.render('register',{
            errors,
            name,
            email,
            password,
            password2
        });
        } else {
            const newUser = new User({
                name,
                email,
                password
            });

            bcrypt.genSalt(10, (err,salt) =>
                bcrypt.hash(newUser.password,salt,(err,hash)=>{
                    if(err) throw err;

                    newUser.password = hash;

                    newUser.save()
                    .then(user =>{
                        req.flash('success_msg','You are now Registered and can Log In.')
                        res.redirect('/users/login');
                    })
                    .catch(err => console.log(err));
            }))

        }
    });
}
});

router.post('/login',(req,res,next) => {
    passport.authenticate('local', {
       successRedirect: '/dashboard',
       failureRedirect: '/users/login',
       failureFlash: true 
    })(req,res,next);
});

router.get('/logout', (req,res) =>{
req.logout();
req.flash('success_msg','You are successfully logged out.');
res.redirect('/users/login');
});

module.exports = router;