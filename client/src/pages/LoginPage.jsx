import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';
import { login } from '@/api';
import { useNavigate } from 'react-router-dom';

// TODO (LoginPage): Frontend Developer – จัด form, handle login, navigate on success