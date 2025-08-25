import { createSlice } from '@reduxjs/toolkit';


const userSlice = createSlice({
  name: 'user',
  initialState: {name: '', email:'', phoneNumber:'', address:'',role:'', token:null },
  reducers: {
    changeUserName: (state, action) => {
        state.name = action.payload;
    },
    changeEmail : (state, action) => {
        state.email = action.payload;
    },
    changePhoneNumber : (state, action) => {
        state.phoneNumber = action.payload;
    },
    changeAddress : (state, action) => {
        state.address = action.payload;
    },
    updateToken : (state, action) => {
      state.token = action.payload;
    },
    changeRole : (state, action) => {
        state.role = action.payload;
    },
  logout: (state) => {
    state.name = '',
    state.email = '',
    state.phoneNumber = '',
    state.address = '',
    state.role = '',
    state.token = null
  }
}
});


export const {changeAddress, changeEmail, changePhoneNumber, changeUserName,changeRole, logout, updateToken} = userSlice.actions;

export default userSlice.reducer;