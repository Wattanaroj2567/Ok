import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';
import { register } from '@/api';
import { useNavigate } from 'react-router-dom';

// TODO (RegisterPage): Frontend Developer – จัด form, handle register, navigate on success