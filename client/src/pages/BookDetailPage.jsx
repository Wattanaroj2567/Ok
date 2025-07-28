import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { fetchBook } from '@/api';
import ReviewForm from '@/components/review/ReviewForm';
import ReviewList from '@/components/review/ReviewList';

// TODO (BookDetailPage): Frontend Developer – fetchBook → แสดงรายละเอียด + ปุ่มรีวิว