// Cấu hình Firebase của ứng dụng web
// Đối với SDK Firebase JS v7.20.0 trở lên, measurementId là tùy chọn
var firebaseConfig = {
  apiKey: "AIzaSyDO3DB5OM-A2aWtVCbV0IxNTIk49OljHdk",
  authDomain: "doan-e849e.firebaseapp.com",
  databaseURL: "https://doan-e849e.firebaseio.com",
  projectId: "doan-e849e",
  storageBucket: "doan-e849e.appspot.com",
  messagingSenderId: "744905234473",
  appId: "1:744905234473:web:da4b79067474dceecde438",
  measurementId: "G-CJYT0D750R",
};
// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);
// Phần đăng nhập
firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
	  // Người dùng đã đăng nhập.
	  var user = firebase.auth().currentUser;
	  if(!window.location.href.includes("admin_dashboard")){ // Kiểm tra nếu ko phải là trang admin thì chuyển sang trang admin
		if(user.uid == "hPp1bY0FZKQVW9tKLWlUY1uCRlE2") {
		  if(user != null){
			  location.replace("admin_dashboard.html");
		  }
		}
		else {
		  var email_id = user.email; //Lấy tên tài khoản
		  document.getElementById("user_para").innerHTML = "Tài khoản '" + email_id + "' chưa có dữ iệu trên máy chủ.";
		  document.getElementById("user_div").style.display = "block";
		  document.getElementById("login_div").style.display = "none";
		}
	  }
	} else {
	  // Không có người dùng nào đăng nhập.
	  document.getElementById("user_div").style.display = "none";
	  document.getElementById("login_div").style.display = "block";
	}
});
function login(){
	var userEmail = document.getElementById("email_field").value;
	var userPass = document.getElementById("password_field").value;
	firebase.auth().signInWithEmailAndPassword(userEmail, userPass).catch(function(error) {
	  // Đăng nhập thất bại.
	  var errorCode = error.code; // Lấy mã thông báo rồi so sánh để đưa ra thông báo
	  var error1 = "auth/invalid-email"
	  var error2 = "auth/user-not-found"
	  var error3 = "auth/wrong-password"
	  if(errorCode == error1){
		window.alert("Sai định dạng email.");
	  } else if(errorCode == error2){
		window.alert("Tài khoản chưa được đăng ký.");
	  } else if(errorCode == error3){
		window.alert("Sai mật khẩu.");
	  }
	});
}
function logout(){
  firebase.auth().signOut().then(function(){
	if(!window.location.href.includes("index")){ // Kiểm tra nếu ko phải là trang chủ thì chuyển sang trang chủ
		location.replace("index.html");
	}
	window.alert("Đã đăng xuất.");
  }).catch(function(){
	console.log("Lỗi hàm logout.")
  });
}