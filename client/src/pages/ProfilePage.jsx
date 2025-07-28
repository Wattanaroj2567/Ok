import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Avatar } from '@mui/material';
import { fetchUser, updateProfile, deleteUser } from '@/api';

// TODO (ProfilePage): Frontend Developer – fetchUser → แสดงข้อมูล, จัด updateProfile + deleteUser