import React, { useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import BookCard from '@/components/book/BookCard';
import { fetchBooks } from '@/api';

// TODO (BookList): Frontend Developer – ดึงข้อมูลด้วย fetchBooks และรัน BookCard ใน grid