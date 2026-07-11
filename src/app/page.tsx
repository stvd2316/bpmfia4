'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// Import Aset dari src/app/assets (untuk ditampilkan di dalam halaman)
import logoBpm from './assets/logobpm.webp';
import gedungFia from './assets/gedungfia.webp';
import lineLogo from './assets/line.png';
import piImg from './assets/pi.webp';
import kominfoImg from './assets/kominfo.webp';
import kokumImg from './assets/kokum.webp';

// Inisialisasi Supabase Client
const supabaseUrl = 'https://fogkgkqnxpzedmtclhil.supabase.co';
const supabaseKey = 'sb_publishable_0iQBBuVFUdVLHgMSe6Y_0g_F_rGHFcv';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showAllPeraturan, setShowAllPeraturan] = useState(false);
  const [selectedPeraturan, setSelectedPeraturan] = useState<any>(null);
  const [showAboutUs, setShowAboutUs] = useState(false);
  const [showStatusIkm, setShowStatusIkm] = useState(false);
  const [searchIkm, setSearchIkm] = useState('');
  
  // State untuk Data IKM dari Supabase
  const [ikmData, setIkmData] = useState<any[]>([]);
  const [loadingIkm, setLoadingIkm] = useState<boolean>(false);
  const [errorIkm, setErrorIkm] = useState<string | null>(null);

  // State untuk Edit Nilai IKM
  const [editingIkmId, setEditingIkmId] = useState<any>(null);
  const [editingNilai, setEditingNilai] = useState<string>('');
  const [updatingIkm, setUpdatingIkm] = useState<boolean>(false);

  // Admin States
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Form States (Peraturan)
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    judul: '',
    jenisDokumen: '',
    tahun: '',
    tglPenetapan: '',
    tempatPenetapan: 'Depok',
    tglBerlaku: '',
    status: 'Berlaku',
    perubahanTerkini: []
  });

  // Calendar & Event States
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [today, setToday] = useState<Date | null>(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventFormData, setEventFormData] = useState({
    date: '',
    eventName: '',
    eventNews: ''
  });

  // Data Peraturan
  const [peraturanData, setPeraturanData] = useState([
    {
      id: 1,
      judul: "Hukum Acara Mahkamah Mahasiswa Fakultas Ilmu Administrasi Universitas Indonesia",
      jenisDokumen: "Undang - Undang IKM",
      tahun: "2024",
      tglPenetapan: "04-11-2024",
      tempatPenetapan: "Depok",
      tglBerlaku: "04-11-2024",
      status: "Berlaku",
      perubahanTerkini: [
        { nomor: "003/PER/BPMFIAUI/III/2026", judul: "Peraturan Perubahan Kedua" },
        { nomor: "002/PER/BPMFIAUI/I/2026", judul: "Peraturan Perubahan Pertama" }
      ]
    },
    {
      id: 2,
      judul: "Mekanisme Pengajuan Usul Inisiatif Mahasiswa",
      jenisDokumen: "Peraturan BPM",
      tahun: "2024",
      tglPenetapan: "15-09-2024",
      tempatPenetapan: "Depok",
      tglBerlaku: "15-09-2024",
      status: "Berlaku",
      perubahanTerkini: [
        { nomor: "005/PER/BPMFIAUI/II/2026", judul: "Penyesuaian Mekanisme Pengajuan" }
      ]
    },
    {
      id: 3,
      judul: "Standar Kode Etik Anggota Legislatif",
      jenisDokumen: "Peraturan BPM",
      tahun: "2024",
      tglPenetapan: "20-05-2024",
      tempatPenetapan: "Depok",
      tglBerlaku: "20-05-2024",
      status: "Berlaku",
      perubahanTerkini: []
    },
    {
      id: 4,
      judul: "Pengelolaan Keuangan Organisasi Mahasiswa",
      jenisDokumen: "Peraturan BPM",
      tahun: "2024",
      tglPenetapan: "10-01-2024",
      tempatPenetapan: "Depok",
      tglBerlaku: "10-01-2024",
      status: "Tidak Berlaku",
      perubahanTerkini: []
    }
  ]);

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now);
    setToday(now);
    
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch Data IKM dari Supabase HANYA saat user mencari (Debounced)
  useEffect(() => {
    const searchTerm = searchIkm.trim();
    
    if (searchTerm === '') {
      setIkmData([]);
      setLoadingIkm(false);
      setErrorIkm(null);
      return;
    }

    setLoadingIkm(true);
    setErrorIkm(null);

    const delayDebounceFn = setTimeout(async () => {
      const { data, error } = await supabase
        .from('status_ikm_fia_ui')
        .select('*')
        .ilike('Nama Lengkap', `%${searchTerm}%`); 
      
      if (error) {
        console.error('Supabase Error:', error.message);
        setErrorIkm(error.message);
        setIkmData([]);
      } else if (data) {
        const normalizedData = data.map((item: any) => ({
          id: item.No || item.id, 
          nama: item["Nama Lengkap"] || item.nama || item.Nama || '-',
          jurusan: item.Jurusan || item.jurusan || item.Jurusans || '-',
          nilai: item.Nilai || item.nilai || '0',
          status: item.Status || item.status || '-'
        }));
        setIkmData(normalizedData);
      }
      setLoadingIkm(false);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchIkm]);

  // --- FETCH EVENTS DARI SUPABASE ---
  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase.from('iss_events').select('*');
      if (data) {
        const mappedEvents = data.map((e: any) => ({
          id: e.id,
          dateKey: e.date_key,
          title: e.title,
          description: e.description
        }));
        setEvents(mappedEvents);
      }
    };
    fetchEvents();
  }, []);

  // --- REALTIME UNTUK IKM & EVENTS (Dengan Pencegahan Duplikasi) ---
  useEffect(() => {
    const channel = supabase
      .channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'status_ikm_fia_ui' },
        (payload) => {
          const updatedRow = payload.new;
          setIkmData((prevData) =>
            prevData.map((item) =>
              item.id === updatedRow.No ? {
                ...item,
                nilai: updatedRow.Nilai,
                status: updatedRow.Status
              } : item
            )
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'iss_events' },
        (payload) => {
          const newEvent = payload.new;
          setEvents(prev => {
            // CEGAH DUPLIKASI: Cek dulu apakah ID event sudah ada
            if (prev.some(e => e.id === newEvent.id)) return prev;
            return [...prev, { id: newEvent.id, dateKey: newEvent.date_key, title: newEvent.title, description: newEvent.description }];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'iss_events' },
        (payload) => {
          const deletedEvent = payload.old;
          setEvents(prev => prev.filter(e => e.id !== deletedEvent.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleEditIkm = (item: any) => {
    setEditingIkmId(item.id);
    setEditingNilai(item.nilai.toString());
  };

  const handleCancelEditIkm = () => {
    setEditingIkmId(null);
    setEditingNilai('');
  };

  const handleSaveIkm = async (item: any) => {
    const newNilai = parseFloat(editingNilai);
    if (isNaN(newNilai)) {
      alert("Nilai harus berupa angka!");
      return;
    }
    
    const newStatus = newNilai >= 85 ? 'AKTIF' : 'PASIF';
    setUpdatingIkm(true);
    
    const { error } = await supabase
      .from('status_ikm_fia_ui')
      .update({ 'Nilai': newNilai, 'Status': newStatus })
      .eq('No', item.id); 
    
    if (error) {
      console.error('Error updating:', error.message);
      alert('Gagal mengupdate data: ' + error.message);
    } else {
      setIkmData(prevData => prevData.map(d => 
        d.id === item.id ? { ...d, nilai: newNilai, status: newStatus } : d
      ));
      setEditingIkmId(null);
      setEditingNilai('');
    }
    setUpdatingIkm(false);
  };

  const totalDokumen = peraturanData.length;
  const totalBerlaku = peraturanData.filter(p => p.status === 'Berlaku').length;
  const totalDicabut = peraturanData.filter(p => p.status === 'Dicabut').length;

  const goToAllPeraturan = () => {
    setShowAllPeraturan(true);
    setShowAboutUs(false);
    setShowStatusIkm(false);
    setSelectedPeraturan(null);
    window.scrollTo(0, 0);
    window.history.pushState({ page: 'all_peraturan' }, '', '#peraturan');
  };

  const goToHome = () => {
    setShowAllPeraturan(false);
    setShowAboutUs(false);
    setShowStatusIkm(false);
    setSelectedPeraturan(null);
    window.scrollTo(0, 0);
    if (window.location.hash && window.location.hash !== '#home') {
      window.history.pushState({ page: 'home' }, '', '#home');
    }
  };

  const goToAboutUs = () => {
    const currentScroll = window.scrollY;
    window.history.replaceState({ 
      page: showAllPeraturan ? 'all_peraturan' : 'home', 
      scroll: currentScroll 
    }, '', window.location.href);

    setShowAboutUs(true);
    setShowAllPeraturan(false);
    setShowStatusIkm(false);
    setSelectedPeraturan(null);
    window.scrollTo(0, 0);
    window.history.pushState({ page: 'about' }, '', '#about');
  };

  const goToStatusIkm = () => {
    const currentScroll = window.scrollY;
    window.history.replaceState({ 
      page: showAllPeraturan ? 'all_peraturan' : 'home', 
      scroll: currentScroll 
    }, '', window.location.href);

    setShowStatusIkm(true);
    setShowAboutUs(false);
    setShowAllPeraturan(false);
    setSelectedPeraturan(null);
    window.scrollTo(0, 0);
    window.history.pushState({ page: 'status_ikm' }, '', '#status-ikm');
  };

  const goToBerita = () => {
    setShowAllPeraturan(false);
    setShowAboutUs(false);
    setShowStatusIkm(false);
    setSelectedPeraturan(null);
    setMenuOpen(false);
    
    setTimeout(() => {
      const beritaSection = document.getElementById('berita');
      if (beritaSection) {
        beritaSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const goToKontak = () => {
    setShowAllPeraturan(false);
    setShowAboutUs(false);
    setShowStatusIkm(false);
    setSelectedPeraturan(null);
    setMenuOpen(false);
    
    setTimeout(() => {
      const kontakSection = document.getElementById('kontak');
      if (kontakSection) {
        kontakSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const viewDetail = (item: any) => {
    const currentScroll = window.scrollY;
    window.history.replaceState({ 
      page: selectedPeraturan ? 'detail' : (showAllPeraturan ? 'all_peraturan' : 'home'), 
      scroll: currentScroll 
    }, '', window.location.href);

    setSelectedPeraturan(item);
    window.scrollTo(0, 0);
    window.history.pushState({ page: 'detail', id: item.id }, '', `#peraturan/${item.id}`);
  };

  const goBack = () => {
    window.history.back();
  };

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const state = e.state;
      if (!state) return;

      if (state.page === 'detail' && state.id) {
        const item = peraturanData.find(p => p.id === state.id);
        if (item) {
          setSelectedPeraturan(item);
          setShowAllPeraturan(false);
          setShowAboutUs(false);
          setShowStatusIkm(false);
        } else {
          setSelectedPeraturan(null);
          setShowAllPeraturan(true);
        }
      } else if (state.page === 'all_peraturan') {
        setSelectedPeraturan(null);
        setShowAllPeraturan(true);
        setShowAboutUs(false);
        setShowStatusIkm(false);
      } else if (state.page === 'about') {
        setShowAboutUs(true);
        setShowAllPeraturan(false);
        setShowStatusIkm(false);
        setSelectedPeraturan(null);
      } else if (state.page === 'status_ikm') {
        setShowStatusIkm(true);
        setShowAboutUs(false);
        setShowAllPeraturan(false);
        setSelectedPeraturan(null);
      } else {
        setShowAllPeraturan(false);
        setShowAboutUs(false);
        setShowStatusIkm(false);
        setSelectedPeraturan(null);
      }

      if (state && typeof state.scroll === 'number') {
        setTimeout(() => {
          window.scrollTo(0, state.scroll);
        }, 10);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [peraturanData]);

  const formatTanggal = (dateString: string) => {
    const months = [
      "JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI",
      "JULI", "AGUSTAS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"
    ];
    if (!dateString) return "-";
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const day = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const year = parts[2];
      return `${day} ${months[monthIndex]} ${year}`;
    }
    return dateString;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'stvd23' && password === '12345') {
      setIsAdmin(true);
      setShowLogin(false);
      setUsername('');
      setPassword('');
      setLoginError('');
    } else {
      setLoginError('Username atau password salah!');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setMenuOpen(false);
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData({
      judul: '', jenisDokumen: '', tahun: '', tglPenetapan: '', tempatPenetapan: 'Depok', tglBerlaku: '', status: 'Berlaku', perubahanTerkini: []
    });
    setShowForm(true);
    setMenuOpen(false);
  };

  const openEditForm = (item: any) => {
    setEditingId(item.id);
    setFormData({
      judul: item.judul,
      jenisDokumen: item.jenisDokumen,
      tahun: item.tahun,
      tglPenetapan: item.tglPenetapan,
      tempatPenetapan: item.tempatPenetapan,
      tglBerlaku: item.tglBerlaku,
      status: item.status,
      perubahanTerkini: item.perubahanTerkini
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus peraturan ini?')) {
      setPeraturanData(peraturanData.filter(item => item.id !== id));
      if (selectedPeraturan && selectedPeraturan.id === id) {
        goBack();
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setPeraturanData(peraturanData.map(item => item.id === editingId ? { ...formData, id: editingId } : item));
    } else {
      const newItem = { ...formData, id: Date.now() };
      setPeraturanData([newItem, ...peraturanData]);
    }
    setShowForm(false);
  };

  const monthsID = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const daysID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    if (currentDate) setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    if (currentDate) setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const formatDateKey = (date: Date) => {
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  };

  const handleDateClick = (date: Date) => {
    setSelectedCalendarDate(date);
  };

  const isSameDate = (d1: Date | null, d2: Date) => {
    if (!d1) return false;
    return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  };

  const openAddEventForm = () => {
    const initialDate = selectedCalendarDate || today || new Date();
    setEventFormData({
      date: `${initialDate.getFullYear()}-${String(initialDate.getMonth() + 1).padStart(2, '0')}-${String(initialDate.getDate()).padStart(2, '0')}`,
      eventName: '',
      eventNews: ''
    });
    setShowEventForm(true);
  };

  const handleEventSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const dateParts = eventFormData.date.split('-');
    const formattedKey = `${parseInt(dateParts[2])}-${parseInt(dateParts[1])}-${dateParts[0]}`;
    
    // Insert ke Supabase
    const { data, error } = await supabase
      .from('iss_events')
      .insert([
        { 
          date_key: formattedKey, 
          title: eventFormData.eventName, 
          description: eventFormData.eventNews 
        }
      ])
      .select();

    if (error) {
      alert('Gagal menambah event: ' + error.message);
    } else if (data) {
      const newEvent = {
        id: data[0].id,
        dateKey: data[0].date_key,
        title: data[0].title,
        description: data[0].description
      };
      
      // Update lokal secara manual, namun tidak akan duplikat karena ada pengecekan ID di Realtime
      setEvents(prev => {
        if (prev.some(e => e.id === newEvent.id)) return prev;
        return [...prev, newEvent];
      });
      
      setShowEventForm(false);
      setSelectedCalendarDate(new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2])));
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (window.confirm('Hapus event ini?')) {
      // Delete dari Supabase
      const { error } = await supabase
        .from('iss_events')
        .delete()
        .eq('id', id);

      if (error) {
        alert('Gagal menghapus event: ' + error.message);
      } else {
        // Update lokal secara manual
        setEvents(events.filter(ev => ev.id !== id));
      }
    }
  };

  const selectedDateEvents = selectedCalendarDate ? events.filter(ev => ev.dateKey === formatDateKey(selectedCalendarDate)) : [];

  const renderCalendarDays = () => {
    if (!currentDate) return null;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const blanks = [];
    for (let i = 0; i < firstDay; i++) {
      blanks.push(<div key={`blank-${i}`} className="cal-day empty"></div>);
    }

    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const dateKey = formatDateKey(dateObj);
      const hasEvent = events.some(ev => ev.dateKey === dateKey);
      const isToday = today ? isSameDate(today, dateObj) : false;
      const isSelected = isSameDate(selectedCalendarDate, dateObj);
      const dayOfWeek = dateObj.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      days.push(
        <div 
          key={`day-${d}`} 
          className={`cal-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isWeekend ? 'weekend' : ''}`} 
          onClick={() => handleDateClick(dateObj)}
        >
          {d}
          {hasEvent && <span className="event-dot"></span>}
        </div>
      );
    }

    return [...blanks, ...days];
  };

  const ImageSwiper = () => {
    const images = [piImg, kominfoImg, kokumImg];
    const cardWidth = 300; 
    const cardHeight = 400;

    const cardStackRef = useRef<HTMLDivElement>(null);
    const isSwiping = useRef(false);
    const startX = useRef(0);
    const startY = useRef(0);
    const currentX = useRef(0);
    const animationFrameId = useRef<number | null>(null);
    const isHorizontalSwipe = useRef<boolean | null>(null);

    const [cardOrder, setCardOrder] = useState<number[]>(() =>
      Array.from({ length: images.length }, (_, i) => i)
    );

    const getCards = useCallback((): HTMLElement[] => {
      if (!cardStackRef.current) return [];
      const nodeElements = cardStackRef.current.querySelectorAll('.image-card');
      const elements: HTMLElement[] = [];
      for (let i = 0; i < nodeElements.length; i++) {
        elements.push(nodeElements[i] as HTMLElement);
      }
      return elements;
    }, []);

    const getActiveCard = useCallback((): HTMLElement | null => {
      const cards = getCards();
      return cards[0] || null;
    }, [getCards]);

    const updatePositions = useCallback(() => {
      const cards = getCards();
      cards.forEach((card, i) => {
        card.style.setProperty('--i', (i + 1).toString());
        card.style.setProperty('--swipe-x', '0px');
        card.style.setProperty('--swipe-rotate', '0deg');
        card.style.opacity = '1';
      });
    }, [getCards])

    const applySwipeStyles = useCallback((deltaX: number) => {
      const card = getActiveCard();
      if (!card) return;
      card.style.setProperty('--swipe-x', `${deltaX}px`);
      card.style.setProperty('--swipe-rotate', `${deltaX * 0.2}deg`);
      card.style.opacity = (1 - Math.min(Math.abs(deltaX) / 100, 1) * 0.75).toString();
    }, [getActiveCard])

    const handleEnd = useCallback(() => {
      if (!isSwiping.current || isHorizontalSwipe.current === false) {
        isSwiping.current = false;
        isHorizontalSwipe.current = null;
        return;
      }

      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }

      const deltaX = currentX.current - startX.current;
      const threshold = 50;
      const duration = 300;
      const card = getActiveCard();

      if (card) {
        card.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;

        if (Math.abs(deltaX) > threshold) {
          const direction = Math.sign(deltaX);
          card.style.setProperty('--swipe-x', `${direction * 300}px`);
          card.style.setProperty('--swipe-rotate', `${direction * 20}deg`);

          setTimeout(() => {
            if (getActiveCard() === card) {
              card.style.setProperty('--swipe-rotate', `${-direction * 20}deg`);
            }
          }, duration * 0.5);

          setTimeout(() => {
            setCardOrder(prev => {
              if (prev.length === 0) return [];
              return [...prev.slice(1), prev[0]];
            });
          }, duration);
        } else {
          applySwipeStyles(0);
        }
      }

      isSwiping.current = false;
      isHorizontalSwipe.current = null;
      startX.current = 0;
      currentX.current = 0;
    }, [getActiveCard, applySwipeStyles])

    const handleMove = useCallback((clientX: number, clientY: number) => {
      if (!isSwiping.current) return;

      if (isHorizontalSwipe.current === null) {
        const dx = Math.abs(clientX - startX.current);
        const dy = Math.abs(clientY - startY.current);
        
        if (dx > 10 || dy > 10) {
          isHorizontalSwipe.current = dx > dy;
          if (!isHorizontalSwipe.current) {
            isSwiping.current = false; 
            return;
          }
        } else {
          return; 
        }
      }

      if (!isHorizontalSwipe.current) return;

      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      animationFrameId.current = requestAnimationFrame(() => {
        currentX.current = clientX;
        const deltaX = currentX.current - startX.current;
        applySwipeStyles(deltaX);

        if (Math.abs(deltaX) > 50) {
          handleEnd(); 
        }
      });
    }, [applySwipeStyles, handleEnd])

    useEffect(() => {
      const cardStackElement = cardStackRef.current;
      if (!cardStackElement) return;

      const onPointerDown = (e: PointerEvent) => {
        isSwiping.current = true;
        isHorizontalSwipe.current = null;
        startX.current = e.clientX;
        startY.current = e.clientY;
        currentX.current = e.clientX;
        const card = getActiveCard();
        if (card) card.style.transition = 'none';
      };

      const onPointerMove = (e: PointerEvent) => {
        if (!isSwiping.current) return;
        handleMove(e.clientX, e.clientY);
      };

      const onPointerUp = () => handleEnd();

      cardStackElement.addEventListener('pointerdown', onPointerDown);
      cardStackElement.addEventListener('pointermove', onPointerMove);
      cardStackElement.addEventListener('pointerup', onPointerUp);
      cardStackElement.addEventListener('pointercancel', onPointerUp);
      cardStackElement.addEventListener('pointerleave', onPointerUp);

      return () => {
        cardStackElement.removeEventListener('pointerdown', onPointerDown);
        cardStackElement.removeEventListener('pointermove', onPointerMove);
        cardStackElement.removeEventListener('pointerup', onPointerUp);
        cardStackElement.removeEventListener('pointercancel', onPointerUp);
        cardStackElement.removeEventListener('pointerleave', onPointerUp);
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
      };
    }, [handleMove, handleEnd, getActiveCard])

    useEffect(() => {
      updatePositions();
    }, [cardOrder, updatePositions])

    return (
      <div
        className="card-stack-container"
        ref={cardStackRef}
        style={{
          width: cardWidth + 32,
          height: cardHeight + 32,
          position: 'relative',
          display: 'grid',
          placeContent: 'center',
          userSelect: 'none',
          transformStyle: 'preserve-3d',
          perspective: '700px',
          margin: '0 auto',
          touchAction: 'pan-y' 
        }}
      >
        {cardOrder.map((originalIndex, displayIndex) => (
          <div
            key={`${images[originalIndex].src}-${originalIndex}`}
            className="image-card"
            style={{
              '--i': (displayIndex + 1).toString(),
              zIndex: images.length - displayIndex,
              width: cardWidth,
              height: cardHeight,
              transform: `perspective(700px)
                         translateZ(calc(-12px * var(--i)))
                         translateY(calc(7px * var(--i)))
                         translateX(var(--swipe-x, 0px))
                         rotateY(var(--swipe-rotate, 0deg))`
            } as React.CSSProperties}
          >
            <img
              src={images[originalIndex].src}
              alt={`Foto ${originalIndex + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                pointerEvents: 'none',
                borderRadius: 'var(--radius-lg)'
              }}
              draggable={false}
            />
          </div>
        ))}
      </div>
    );
  };

  const heroBgStyle = {
    backgroundImage: `url(${gedungFia.src})`,
    backgroundColor: 'var(--surface-dark)'
  };

  if (!currentDate || !today) {
    return <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000' }}></div>;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Montserrat:wght@400;600;700&display=swap');

        :root {
          --primary-gold: #ffd155;
          --primary-gold-dark: #B8960C;
          --ink: #000000;
          --canvas: #ffffff;
          --surface-dark: #000000;
          --surface-soft: #f7f7f7;
          --hairline: #e2e8f0;
          --hairline-strong: #cbd5e1;
          --body: #1a1a1a;
          --mute: #757575;
          --ash: #a7a7a7;
          --on-dark: #ffffff;
          --on-dark-mute: rgba(255,255,255,0.7);
          --link-blue: #0046a4;
          --status-success: #16a34a;
          --status-error: #dc2626;
          --status-revoked: #333333;
          --font-heading: 'Montserrat', Arial, Helvetica, sans-serif;
          --font-body: 'Lato', Arial, Helvetica, sans-serif;
          --radius-sm: 8px;
          --radius-md: 12px;
          --radius-lg: 16px;
          --radius-xl: 24px;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: var(--font-body);
          background-color: var(--canvas);
          color: var(--ink);
          -webkit-font-smoothing: antialiased;
        }

        .navbar {
          position: fixed; top: 0; left: 0; width: 100%;
          display: flex; justify-content: space-between; align-items: center;
          padding: 0 32px; z-index: 1000; transition: height 0.3s, background 0.3s, box-shadow 0.3s;
          background: ${scrolled || showAllPeraturan || selectedPeraturan || showAboutUs || showStatusIkm ? 'rgba(0,0,0,0.85)' : 'transparent'};
          backdrop-filter: blur(10px);
          box-shadow: ${scrolled || showAllPeraturan || selectedPeraturan || showAboutUs || showStatusIkm ? '0 4px 30px rgba(0,0,0,0.2)' : 'none'};
          height: ${scrolled || showAllPeraturan || selectedPeraturan || showAboutUs || showStatusIkm ? '56px' : '64px'};
          border-bottom: 1px solid ${scrolled || showAllPeraturan || selectedPeraturan || showAboutUs || showStatusIkm ? 'var(--hairline-strong)' : 'transparent'};
        }

        .nav-logo { display: flex; align-items: center; gap: 12px; cursor: pointer; margin-right: auto; }
        .nav-logo img { height: 40px; width: auto; transition: height 0.3s ease; filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.3)); }
        .navbar.scrolled .nav-logo img, .page-peraturan .nav-logo img { height: 36px; }

        .nav-logo-text {
          display: flex; flex-direction: column; font-family: var(--font-heading); font-weight: 700; font-size: 16px; line-height: 1.25;
          color: var(--on-dark); text-transform: uppercase; letter-spacing: 0.5px; text-align: left;
        }
        .nav-logo-text span:last-child { font-weight: 700; font-size: 11px; letter-spacing: 1px; color: var(--on-dark-mute); }

        .nav-links { 
          display: ${menuOpen ? 'flex' : 'none'}; 
          position: absolute; top: 100%; right: 16px; width: 260px; 
          background: rgba(255,255,255,0.95); backdrop-filter: blur(20px);
          flex-direction: column; align-items: stretch; justify-content: flex-start; 
          gap: 0; margin: 0; box-shadow: 0 10px 30px rgba(0,0,0,0.15); 
          border: 1px solid var(--hairline); border-radius: var(--radius-lg);
          padding: 8px; overflow: hidden;
        }
        .nav-links.active { display: flex; }
        .nav-links li { width: 100%; border-bottom: 1px solid var(--hairline); }
        .nav-links li:last-child { border-bottom: none; }
        .nav-links a { 
          font-family: var(--font-heading); color: var(--ink) !important; font-size: 16px; padding: 12px 16px; 
          display: block; text-align: left; text-decoration: none; font-weight: 600; text-transform: uppercase; border-radius: var(--radius-sm); transition: background 0.2s;
        }
        .nav-links a:hover { background: var(--surface-soft); color: var(--primary-gold-dark) !important; }
        .mobile-admin-link { color: var(--primary-gold-dark) !important; font-weight: 700; }
        
        .admin-controls { display: flex; align-items: center; gap: 16px; z-index: 1001; }
        .menu-toggle { display: flex; flex-direction: column; gap: 6px; cursor: pointer; padding: 8px; border-radius: var(--radius-sm); outline: none; background: transparent; border: none; transition: background 0.2s; }
        .menu-toggle:hover { background: rgba(255,255,255,0.1); }
        .menu-toggle svg { width: 24px; height: 24px; color: var(--on-dark); pointer-events: none; }
        .menu-toggle .line1 { transform-origin: center; transition: transform 0.3s cubic-bezier(.5,.85,.25,1.1); transform: translateY(-7px); }
        .menu-toggle .line2 { transform-origin: center; transition: transform 0.3s cubic-bezier(.5,.85,.25,1.8); }
        .menu-toggle .line3 { transform-origin: center; transition: transform 0.3s cubic-bezier(.5,.85,.25,1.1); transform: translateY(7px); }
        .menu-toggle[aria-expanded="true"] .line1 { transform: rotate(315deg); }
        .menu-toggle[aria-expanded="true"] .line2 { transform: rotate(45deg); }
        .menu-toggle[aria-expanded="true"] .line3 { transform: rotate(135deg); }

        .btn-admin-action { background: var(--primary-gold); color: var(--ink); border: none; width: 32px; height: 32px; border-radius: var(--radius-sm); font-size: 20px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .btn-logout { background: transparent; color: var(--status-error) !important; border: 1px solid var(--status-error); padding: 4px 12px; border-radius: var(--radius-sm); font-weight: 700; font-size: 12px; cursor: pointer; text-transform: uppercase; font-family: var(--font-heading); }

        .hero { position: relative; height: 100vh; min-height: 600px; display: flex; align-items: center; justify-content: flex-start; text-align: left; background-size: cover; background-position: center center; background-repeat: no-repeat; }
        .hero::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.2) 100%); }
        .hero-content { position: relative; z-index: 2; color: var(--on-dark); padding: 0 10%; max-width: 800px; }
        .hero-badge { display: inline-block; background: var(--primary-gold); color: var(--ink); padding: 6px 16px; border-radius: var(--radius-sm); font-size: 14px; font-weight: 700; margin-bottom: 24px; text-transform: uppercase; font-family: var(--font-heading); }
        .hero h1 { font-family: var(--font-heading); font-size: 48px; font-weight: 700; margin-bottom: 20px; line-height: 1.25; text-transform: uppercase; }
        .hero p { font-family: var(--font-body); font-size: 22px; font-weight: 400; margin-bottom: 40px; color: var(--on-dark-mute); line-height: 1.75; }

        .btn-primary { display: inline-flex; background: var(--primary-gold); color: var(--ink); padding: 11px 24px; text-decoration: none; font-weight: 700; border-radius: var(--radius-md); border: none; cursor: pointer; font-family: var(--font-heading); font-size: 16px; transition: all 0.2s; text-transform: uppercase; height: 44px; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .btn-primary:hover { background: var(--primary-gold-dark); transform: translateY(-1px); box-shadow: 0 6px 8px rgba(0,0,0,0.15); }

        .stats-section { background: var(--canvas); padding: 32px; position: relative; z-index: 3; max-width: 90%; margin-left: auto; margin-right: auto; border: 1px solid var(--hairline); border-radius: var(--radius-lg); display: grid; grid-template-columns: repeat(3, 1fr); gap: 0px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
        .stat-item { text-align: center; padding: 20px; border-right: 1px solid var(--hairline); position: relative; }
        .stat-item:last-child { border-right: none; }
        .stat-item::before { content: ''; position: absolute; top: 0; left: 0; width: 12px; height: 12px; background: var(--primary-gold); z-index: 2; border-radius: 0 0 4px 0; }
        .stat-item:nth-child(2)::before { background: var(--status-success); }
        .stat-item:nth-child(3)::before { background: var(--status-error); }
        .stat-number { font-family: var(--font-heading); font-size: 36px; font-weight: 700; color: var(--ink); line-height: 1.25; margin-bottom: 8px; }
        .stat-label { font-family: var(--font-heading); font-size: 14px; color: var(--body); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

        .section { padding: 64px 5%; background: var(--canvas); }
        .section-header { text-align: center; margin-bottom: 48px; }
        .section-header h2 { font-family: var(--font-heading); font-size: 36px; font-weight: 700; color: var(--ink); margin-bottom: 16px; text-transform: uppercase; }
        .section-header p { font-family: var(--font-body); color: var(--mute); font-size: 16px; max-width: 600px; margin: 0 auto; line-height: 1.5; }

        .cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; max-width: 100%; margin: 0 auto; }
        .card { background: var(--canvas); overflow: hidden; border: 1px solid var(--hairline); border-radius: var(--radius-lg); transition: all 0.3s ease; display: flex; flex-direction: column; position: relative; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .card::before { content: ''; position: absolute; top: 0; left: 0; width: 12px; height: 12px; background: var(--primary-gold); z-index: 2; border-radius: 0 0 4px 0; }
        .card:hover { border-color: var(--primary-gold); transform: translateY(-4px); box-shadow: 0 12px 20px rgba(0,0,0,0.1); }
        .card-header { background: var(--ink); padding: 12px 24px; color: var(--on-dark); font-family: var(--font-heading); font-weight: 700; display: flex; justify-content: space-between; align-items: center; font-size: 14px; text-transform: uppercase; }
        .card-date { font-family: var(--font-body); font-size: 12px; color: var(--on-dark-mute); font-weight: 400; }
        .card-body { padding: 24px; flex-grow: 1; display: flex; flex-direction: column; }
        .card-title { font-family: var(--font-heading); font-size: 17px; font-weight: 700; color: var(--body); margin-bottom: 16px; line-height: 1.47; flex-grow: 1; min-height: 40px; text-align: left; }
        .card-actions { display: flex; gap: 8px; margin-top: 12px; border-top: 1px solid var(--hairline); padding-top: 12px; }
        .btn-edit { background: transparent; color: var(--link-blue); border: 1px solid var(--link-blue); padding: 6px 12px; font-size: 12px; font-weight: 700; cursor: pointer; border-radius: var(--radius-sm); text-transform: uppercase; font-family: var(--font-heading); }
        .btn-delete { background: transparent; color: var(--status-error); border: 1px solid var(--status-error); padding: 6px 12px; font-size: 12px; font-weight: 700; cursor: pointer; border-radius: var(--radius-sm); text-transform: uppercase; font-family: var(--font-heading); }

        .btn-outline { display: inline-flex; border: 2px solid var(--primary-gold); color: var(--primary-gold); padding: 8px 13px; text-decoration: none; font-weight: 700; font-size: 14.4px; border-radius: var(--radius-md); transition: all 0.2s; cursor: pointer; background: transparent; font-family: var(--font-heading); text-transform: uppercase; align-self: flex-start; margin-top: auto; }
        .btn-outline:hover { background: var(--primary-gold); color: var(--ink); }

        .btn-more-container { text-align: center; margin-top: 48px; }
        .btn-back { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 32px; color: var(--primary-gold); font-weight: 700; font-size: 16px; cursor: pointer; background: none; border: none; font-family: var(--font-heading); text-transform: uppercase; }

        .image-card { position: absolute; place-self: center; border: 1px solid var(--hairline); border-radius: var(--radius-lg); box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; will-change: transform; cursor: grab; touch-action: pan-y; }
        .image-card:active { cursor: grabbing; }

        .status-table-container { max-width: 800px; margin: 0 auto; overflow-x: auto; border: 1px solid var(--hairline); border-radius: var(--radius-lg); box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .status-table { width: 100%; border-collapse: collapse; min-width: 500px; }
        .status-table th { background-color: var(--ink); color: var(--on-dark); padding: 12px 16px; text-align: left; font-family: var(--font-heading); font-size: 14px; text-transform: uppercase; border-bottom: 1px solid var(--ink); }
        .status-table td { padding: 12px 16px; border-bottom: 1px solid var(--hairline); font-family: var(--font-body); font-size: 15px; color: var(--body); }
        .status-table tr:last-child td { border-bottom: none; }
        .status-table tr:hover { background-color: var(--surface-soft); }
        .status-highlight-aktif { background-color: rgba(22, 163, 74, 0.1); color: var(--status-success); font-weight: 700; padding: 4px 8px; border-radius: 4px; display: inline-block; }
        .status-highlight-pasif { background-color: rgba(220, 38, 38, 0.1); color: var(--status-error); font-weight: 700; padding: 4px 8px; border-radius: 4px; display: inline-block; }
        .search-input { width: 100%; max-width: 400px; padding: 10px 12px; border: 1px solid var(--hairline-strong); border-radius: var(--radius-sm); font-family: var(--font-body); font-size: 15px; background: var(--surface-soft); margin-bottom: 24px; }
        .search-input:focus { outline: none; border-color: var(--primary-gold); background: var(--canvas); box-shadow: 0 0 0 3px rgba(255,209,85,0.3); }
        
        .nilai-input { width: 80px; padding: 6px 8px; border: 1px solid var(--hairline-strong); border-radius: var(--radius-sm); font-family: var(--font-body); font-size: 14px; }
        .nilai-input:focus { outline: none; border-color: var(--primary-gold); box-shadow: 0 0 0 3px rgba(255,209,85,0.3); }
        .action-cell { display: flex; gap: 8px; }

        .iss-container { max-width: 800px; margin: 0 auto; background: var(--canvas); border: 1px solid var(--hairline); border-radius: var(--radius-xl); padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
        .calendar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--hairline); }
        .calendar-title { font-family: var(--font-heading); font-size: 20px; font-weight: 700; text-transform: uppercase; }
        .calendar-nav { display: flex; gap: 8px; align-items: center; }
        .cal-nav-btn { background: var(--surface-soft); border: 1px solid var(--hairline); width: 32px; height: 32px; border-radius: var(--radius-sm); cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .cal-nav-btn:hover { background: var(--primary-gold); color: var(--ink); border-color: var(--primary-gold); }
        .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
        .cal-weekday { text-align: center; font-family: var(--font-heading); font-size: 12px; font-weight: 700; color: var(--mute); padding: 8px 0; }
        .cal-weekday.weekend { color: var(--ink); }
        .cal-day { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; font-family: var(--font-body); font-size: 14px; border-radius: var(--radius-sm); cursor: pointer; position: relative; transition: all 0.2s; border: 1px solid transparent; }
        .cal-day.empty { cursor: default; border: none; }
        .cal-day:not(.empty):hover { background: var(--surface-soft); border-color: var(--hairline); }
        .cal-day.weekend { color: var(--ink); font-weight: 700; }
        .cal-day.today { font-weight: 700; border: 1px solid var(--primary-gold); color: var(--ink); }
        .cal-day.selected { background: var(--primary-gold); color: var(--ink); font-weight: 700; }
        .event-dot { position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%); width: 5px; height: 5px; background: var(--status-error); border-radius: 50%; }
        .cal-day.selected .event-dot { background: var(--ink); }
        .calendar-events { margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--hairline); }
        .event-item { background: var(--surface-soft); padding: 12px; border-radius: var(--radius-md); margin-bottom: 12px; border-left: 4px solid var(--primary-gold); }
        .event-item h4 { font-family: var(--font-heading); font-size: 16px; margin-bottom: 4px; }
        .event-item p { font-family: var(--font-body); font-size: 14px; color: var(--mute); }
        .no-events { text-align: center; color: var(--mute); font-style: italic; padding: 16px; }
        .add-event-btn { margin-top: 16px; width: 100%; }

        .page-peraturan-container { padding-top: 80px; background: var(--canvas); }
        .detail-layout { max-width: 100%; margin: 0 auto; background: var(--canvas); padding: 48px; border: 1px solid var(--hairline); border-radius: var(--radius-xl); position: relative; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
        .detail-layout::before { content: ''; position: absolute; top: 0; left: 0; width: 16px; height: 16px; background: var(--primary-gold); border-radius: 0 0 4px 0; }
        .detail-title { font-family: var(--font-heading); font-size: 36px; font-weight: 700; color: var(--ink); line-height: 1.25; margin-bottom: 32px; text-align: left; text-transform: uppercase; }

        .info-box { background-color: var(--surface-soft); border: 1px solid var(--hairline); border-radius: var(--radius-lg); padding: 0; margin-bottom: 32px; overflow: hidden; }
        .info-row { display: flex; padding: 12px 24px; border-bottom: 1px solid var(--hairline); }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-family: var(--font-heading); font-weight: 700; color: var(--ink); width: 220px; flex-shrink: 0; font-size: 14px; text-transform: uppercase; text-align: left; }
        .info-value { font-family: var(--font-body); color: var(--body); font-size: 16px; flex-grow: 1; text-align: left; padding-left: 16px; line-height: 1.5; }
        .status-badge { display: inline-block; padding: 4px 10px; border-radius: var(--radius-sm); font-weight: 700; font-size: 14px; text-transform: uppercase; font-family: var(--font-heading); }
        .status-berlaku { background-color: var(--status-success); color: var(--on-dark); }
        .status-tidak-berlaku { background-color: var(--status-error); color: var(--on-dark); }
        .status-dicabut { background-color: var(--status-revoked); color: var(--on-dark); }

        .action-buttons { display: flex; gap: 16px; margin-bottom: 48px; flex-wrap: wrap; }
        .action-btn { display: inline-flex; align-items: center; gap: 8px; padding: 11px 24px; border-radius: var(--radius-md); font-weight: 700; font-size: 16px; cursor: pointer; transition: all 0.2s; text-decoration: none; font-family: var(--font-heading); text-transform: uppercase; height: 44px; }
        .action-btn.primary { background: var(--primary-gold); color: var(--ink); border: 2px solid var(--primary-gold); }
        .action-btn.primary:hover { background: var(--primary-gold-dark); border-color: var(--primary-gold-dark); }
        .action-btn.outline { background: transparent; color: var(--primary-gold); border: 2px solid var(--primary-gold); }
        .action-btn.outline:hover { background: var(--primary-gold); color: var(--ink); }

        .sub-heading { font-family: var(--font-heading); font-size: 24px; font-weight: 700; color: var(--ink); margin-top: 48px; margin-bottom: 16px; border-bottom: 4px solid var(--primary-gold); display: inline-block; text-transform: uppercase; }
        .table-responsive { overflow-x: auto; -webkit-overflow-scrolling: touch; margin-bottom: 48px; width: 100%; }
        .amendment-table { width: 100%; border-collapse: collapse; font-family: var(--font-body); font-size: 16px; min-width: 500px; }
        .amendment-table th { text-align: center; padding: 12px 16px; background-color: var(--ink); color: var(--on-dark); font-family: var(--font-heading); font-weight: 700; border: 1px solid var(--ink); text-transform: uppercase; }
        .amendment-table td { padding: 12px 16px; border: 1px solid var(--hairline); color: var(--body); text-align: left; }
        .amendment-table tr:nth-child(even) { background-color: var(--surface-soft); }

        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); z-index: 2000; display: flex; align-items: center; justify-content: center; }
        .modal-content { background: var(--canvas); padding: 32px; width: 90%; max-width: 500px; border-radius: var(--radius-xl); border: 1px solid var(--hairline); box-shadow: 0 20px 50px rgba(0,0,0,0.2); }
        .modal-title { font-family: var(--font-heading); font-size: 20px; font-weight: 700; margin-bottom: 24px; text-transform: uppercase; text-align: left; }
        .form-group { margin-bottom: 16px; text-align: left; }
        .form-label { display: block; font-family: var(--font-heading); font-weight: 700; font-size: 14px; margin-bottom: 6px; text-transform: uppercase; color: var(--body); }
        .form-input { width: 100%; padding: 10px 12px; border: 1px solid var(--hairline-strong); border-radius: var(--radius-sm); font-family: var(--font-body); font-size: 15px; background: var(--surface-soft); }
        .form-input:focus { outline: none; border-color: var(--primary-gold); background: var(--canvas); box-shadow: 0 0 0 3px rgba(255,209,85,0.3); }
        .form-select { width: 100%; padding: 10px 12px; border: 1px solid var(--hairline-strong); border-radius: var(--radius-sm); font-family: var(--font-body); font-size: 15px; background: var(--surface-soft); }
        .form-actions { display: flex; gap: 12px; margin-top: 24px; }
        .error-text { font-family: var(--font-body); color: var(--status-error); font-size: 14px; margin-top: 8px; font-weight: 700; text-align: left; }

        .footer { background: var(--surface-dark); color: var(--on-dark-mute); padding: 64px 32px 32px; }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px; max-width: 100%; margin: 0 auto; }
        .footer-about h3, .footer-links h4 { margin-bottom: 24px; font-family: var(--font-heading); font-weight: 700; color: var(--on-dark); text-transform: uppercase; font-size: 16px; text-align: left; }
        .footer-about p { font-family: var(--font-body); font-size: 15px; line-height: 1.67; color: var(--on-dark-mute); text-align: left; }
        .footer-links ul { list-style: none; }
        .footer-links ul li { margin-bottom: 12px; text-align: left; }
        .footer-links ul li a { font-family: var(--font-body); color: var(--on-dark-mute); text-decoration: none; transition: color 0.2s; font-size: 15px; cursor: pointer; }
        .footer-links ul li a:hover { color: var(--primary-gold); }
        .social-links { display: flex; gap: 16px; margin-top: 24px; }
        .social-links a { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: transparent; border: 1px solid var(--hairline-strong); border-radius: 50%; color: var(--on-dark); text-decoration: none; transition: all 0.2s; }
        .social-links a:hover { background: var(--primary-gold); color: var(--ink); border-color: var(--primary-gold); }
        .footer-bottom { font-family: var(--font-heading); text-align: center; margin-top: 48px; padding-top: 24px; border-top: 1px solid var(--hairline-strong); font-size: 10px; color: var(--mute); text-transform: uppercase; font-weight: 700; letter-spacing: 1px; }

        @media (max-width: 768px) {
          .navbar { padding: 0 16px; }
          .nav-logo-text { font-size: 14px; }
          .nav-logo-text span:last-child { font-size: 10px; }
          .menu-toggle { display: flex !important; }
          .hero { height: auto; min-height: 90vh; padding-top: 80px; padding-bottom: 60px; align-items: center; }
          .hero-content { padding-top: 0; padding-bottom: 0; }
          .hero h1 { font-size: 32px; }
          .hero p { font-size: 18px; margin-bottom: 32px; }
          .hero .btn-primary { margin-bottom: 0; }
          .stats-section { grid-template-columns: 33.33% 33.33% 33.33%; margin-top: -40px; padding: 16px 12px; width: 90%; max-width: 100%; position: relative; z-index: 10; }
          .stat-item { padding: 10px 4px; }
          .stat-number { font-size: 24px; }
          .stat-label { font-size: 11px; letter-spacing: 0.2px; }
          .cards-grid { grid-template-columns: 1fr; }
          .card-body { padding: 16px; }
          .card-title { font-size: 15px; line-height: 1.4; }
          .footer-grid { grid-template-columns: 1fr; }
          .detail-layout { padding: 24px; }
          .detail-title { font-size: 20px; line-height: 1.3; } 
          .info-row { flex-direction: column; gap: 4px; padding: 10px 16px; }
          .info-label { width: 100%; font-size: 12px; }
          .info-value { padding-left: 0; font-size: 14px; }
          .action-btn { font-size: 14px; padding: 8px 16px; height: 40px; }
          .sub-heading { font-size: 18px; }
          .footer { padding: 64px 5% 32px; }
          .nav-links { right: 16px; width: calc(100% - 32px); }
        }
      `}</style>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="modal-overlay" onClick={() => setShowLogin(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Login Admin</h2>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input type="text" className="form-input" value={username} onChange={e => setUsername(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              {loginError && <p className="error-text">{loginError}</p>}
              <div className="form-actions">
                <button type="submit" className="btn-primary" style={{flex:1}}>Login</button>
                <button type="button" className="action-btn outline" style={{flex:1, justifyContent:'center'}} onClick={() => setShowLogin(false)}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FORM MODAL (ADD/EDIT PERATURAN) */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">{editingId ? 'Edit Peraturan' : 'Tambah Peraturan Baru'}</h2>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Judul</label>
                <input type="text" className="form-input" required value={formData.judul} onChange={e => setFormData({...formData, judul: e.target.value})} placeholder="Masukkan judul peraturan" />
              </div>
              <div className="form-group">
                <label className="form-label">Jenis Dokumen</label>
                <input type="text" className="form-input" required value={formData.jenisDokumen} onChange={e => setFormData({...formData, jenisDokumen: e.target.value})} placeholder="Misal: Undang-Undang IKM, Peraturan BPM" />
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
                <div className="form-group">
                  <label className="form-label">Tahun</label>
                  <input type="text" className="form-input" required value={formData.tahun} onChange={e => setFormData({...formData, tahun: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="Berlaku">Berlaku</option>
                    <option value="Tidak Berlaku">Tidak Berlaku</option>
                    <option value="Dicabut">Dicabut</option>
                  </select>
                </div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
                <div className="form-group">
                  <label className="form-label">Tgl Penetapan (DD-MM-YYYY)</label>
                  <input type="text" className="form-input" required value={formData.tglPenetapan} onChange={e => setFormData({...formData, tglPenetapan: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tgl Berlaku (DD-MM-YYYY)</label>
                  <input type="text" className="form-input" required value={formData.tglBerlaku} onChange={e => setFormData({...formData, tglBerlaku: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Tempat Penetapan</label>
                <input type="text" className="form-input" required value={formData.tempatPenetapan} onChange={e => setFormData({...formData, tempatPenetapan: e.target.value})} />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary" style={{flex:1}}>Simpan</button>
                <button type="button" className="action-btn outline" style={{flex:1, justifyContent:'center'}} onClick={() => setShowForm(false)}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FORM MODAL (ADD EVENT) */}
      {showEventForm && (
        <div className="modal-overlay" onClick={() => setShowEventForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Tambah Event Baru</h2>
            <form onSubmit={handleEventSave}>
              <div className="form-group">
                <label className="form-label">Tanggal Event</label>
                <input type="date" className="form-input" required value={eventFormData.date} onChange={e => setEventFormData({...eventFormData, date: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Nama Event</label>
                <input type="text" className="form-input" required placeholder="Masukkan nama event" value={eventFormData.eventName} onChange={e => setEventFormData({...eventFormData, eventName: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Berita Event</label>
                <textarea className="form-input" required rows={4} placeholder="Deskripsi singkat / berita event" style={{resize: 'vertical', fontFamily: 'var(--font-body)'}} value={eventFormData.eventNews} onChange={e => setEventFormData({...eventFormData, eventNews: e.target.value})} />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary" style={{flex:1}}>Simpan</button>
                <button type="button" className="action-btn outline" style={{flex:1, justifyContent:'center'}} onClick={() => setShowEventForm(false)}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className={`navbar ${scrolled || showAllPeraturan || selectedPeraturan || showAboutUs || showStatusIkm ? 'scrolled' : ''} ${(showAllPeraturan || selectedPeraturan || showAboutUs || showStatusIkm) ? 'page-peraturan' : ''}`}>
        <div className="nav-logo" onClick={goToHome}>
          <img src={logoBpm.src} alt="Logo FIA UI" />
          <div className="nav-logo-text">
            <span>JDIH</span>
            <span>BPM FIA UI</span>
          </div>
        </div>
        
        <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <li><a onClick={() => { goToHome(); setMenuOpen(false); }}>Beranda</a></li>
          <li><a onClick={() => { goToAllPeraturan(); setMenuOpen(false); }}>Peraturan</a></li>
          <li><a onClick={() => { goToAboutUs(); setMenuOpen(false); }}>About Us</a></li>
          <li><a onClick={() => { goToStatusIkm(); setMenuOpen(false); }}>Cek Status IKM</a></li>
          <li><a onClick={() => { goToBerita(); setMenuOpen(false); }}>Berita</a></li>
          <li><a onClick={() => { goToKontak(); setMenuOpen(false); }}>Kontak</a></li>
          {!isAdmin && (
            <li><a className="mobile-admin-link" onClick={() => { setShowLogin(true); setMenuOpen(false); }}>Admin Login</a></li>
          )}
        </ul>

        <div className="admin-controls">
          {isAdmin ? (
            <>
              <button className="btn-logout" onClick={handleLogout}>Logout</button>
              <button className="btn-admin-action" onClick={openAddForm} title="Tambah Peraturan">+</button>
            </>
          ) : null}
          
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={menuOpen ? "Close menu" : "Open menu"}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12L20 12" className="line1" />
              <path d="M4 12H20" className="line2" />
              <path d="M4 12H20" className="line3" />
            </svg>
          </button>
        </div>
      </nav>

      {/* KONDISI HALAMAN */}
      {!showAllPeraturan && !selectedPeraturan && !showAboutUs && !showStatusIkm ? (
        /* HALAMAN BERANDA */
        <>
          <section className="hero" id="beranda" style={heroBgStyle}>
            <div className="hero-content">
              <div className="hero-badge">SELAMAT DATANG</div>
              <h1>Badan Perwakilan Mahasiswa FIA UI</h1>
              <p>Mewakili suara mahasiswa, menjunjung tinggi demokrasi, dan berkomitmen untuk menciptakan lingkungan kampus yang lebih baik.</p>
              <button onClick={goToAllPeraturan} className="btn-primary">Jelajahi Peraturan</button>
            </div>
          </section>

          <div className="stats-section" style={{ marginTop: '-60px' }}>
            <div className="stat-item"><div className="stat-number">{totalDokumen}</div><div className="stat-label">Dokumen</div></div>
            <div className="stat-item"><div className="stat-number">{totalBerlaku}</div><div className="stat-label">Berlaku</div></div>
            <div className="stat-item"><div className="stat-number">{totalDicabut}</div><div className="stat-label">Dicabut</div></div>
          </div>

          <section className="section" id="peraturan">
            <div className="section-header">
              <h2>Peraturan Terbaru</h2>
              <p>Daftar regulasi dan peraturan terkini yang dikeluarkan oleh BPM FIA UI</p>
            </div>
            <div className="cards-grid">
              {peraturanData.map((item) => (
                <div className="card" key={item.id}>
                  <div className="card-header">
                    <span>Peraturan</span>
                    <span className="card-date">{formatTanggal(item.tglPenetapan)}</span>
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{item.judul}</h3>
                    <button className="btn-outline" onClick={() => viewDetail(item)}>View</button>
                    {isAdmin && (
                      <div className="card-actions">
                        <button className="btn-edit" onClick={() => openEditForm(item)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDelete(item.id)}>Hapus</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="btn-more-container">
              <button onClick={goToAllPeraturan} className="btn-primary">More</button>
            </div>
          </section>

          <section className="section" id="berita" style={{ backgroundColor: 'var(--surface-soft)' }}>
            <div className="section-header">
              <h2>Berita Terbaru</h2>
              <p>Informasi dan kabar terkini seputar kegiatan legislatif mahasiswa</p>
            </div>
            <div className="cards-grid">
              <div className="card">
                <div className="card-header"><span>Berita</span><span className="card-date">10 JUNI 2026</span></div>
                <div className="card-body"><h3 className="card-title">Rapat Pleno Pembahasan Anggaran Organisasi Semester Genap 2025/2026</h3><button className="btn-outline">Baca Selengkapnya</button></div>
              </div>
              <div className="card">
                <div className="card-header"><span>Berita</span><span className="card-date">2 JUNI 2026</span></div>
                <div className="card-body"><h3 className="card-title">Konsolidasi Internal Persiapan Musyawarah Mahasiswa Tahunan</h3><button className="btn-outline">Baca Selengkapnya</button></div>
              </div>
              <div className="card">
                <div className="card-header"><span>Berita</span><span className="card-date">20 MEI 2026</span></div>
                <div className="card-body"><h3 className="card-title">Aspirasi Mahasiswa: Evaluasi Kinerja BEM FIA UI Periode 2025/2026</h3><button className="btn-outline">Baca Selengkapnya</button></div>
              </div>
            </div>
          </section>

          <section className="section" id="iss">
            <div className="section-header">
              <h2>ISS (Internal Scheduling System)</h2>
              <p>Jadwal kegiatan dan acara yang akan dilaksanakan oleh BPM FIA UI</p>
            </div>
            <div className="iss-container">
              <div className="calendar-header">
                <div className="calendar-title">{monthsID[currentDate.getMonth()]} {currentDate.getFullYear()}</div>
                <div className="calendar-nav">
                  <button className="cal-nav-btn" onClick={handlePrevMonth}>&lt;</button>
                  <button className="cal-nav-btn" onClick={handleNextMonth}>&gt;</button>
                </div>
              </div>
              <div className="calendar-grid">
                {daysID.map((day, idx) => (
                  <div key={`wd-${idx}`} className={`cal-weekday ${idx === 0 || idx === 6 ? 'weekend' : ''}`}>{day}</div>
                ))}
                {renderCalendarDays()}
              </div>
              <div className="calendar-events">
                {selectedCalendarDate ? (
                  <>
                    <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '16px', textTransform: 'uppercase', fontSize: '16px' }}>
                      Event pada {selectedCalendarDate.getDate()} {monthsID[selectedCalendarDate.getMonth()]} {selectedCalendarDate.getFullYear()}
                    </h3>
                    {selectedDateEvents.length > 0 ? (
                      selectedDateEvents.map(ev => (
                        <div key={ev.id} className="event-item">
                          <h4>{ev.title}</h4>
                          <p>{ev.description}</p>
                          {isAdmin && <button className="btn-delete" style={{ marginTop: '12px' }} onClick={() => handleDeleteEvent(ev.id)}>Hapus Event</button>}
                        </div>
                      ))
                    ) : (
                      <p className="no-events">Tidak ada event pada tanggal ini.</p>
                    )}
                    {isAdmin && <button className="btn-primary add-event-btn" onClick={openAddEventForm}>+ Tambah Event Baru</button>}
                  </>
                ) : (
                  <>
                    <p className="no-events">Klik pada salah satu tanggal untuk melihat detail event.</p>
                    {isAdmin && <button className="btn-primary add-event-btn" onClick={openAddEventForm}>+ Tambah Event Baru</button>}
                  </>
                )}
              </div>
            </div>
          </section>
        </>
      ) : showStatusIkm ? (
        /* HALAMAN CEK STATUS IKM */
        <div className="page-peraturan-container">
          <section className="section">
            <button className="btn-back" onClick={goBack}>← Kembali ke Beranda</button>
            <div className="section-header">
              <h2>Cek Status IKM</h2>
              <p>Masukkan nama mahasiswa untuk mengecek status IKM.</p>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
              <input 
                type="text" 
                className="search-input" 
                placeholder="Cari nama mahasiswa..." 
                value={searchIkm} 
                onChange={(e) => setSearchIkm(e.target.value)} 
              />
            </div>

            <div className="status-table-container">
              <table className="status-table">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Jurusan</th>
                    <th>Nilai</th>
                    <th>Status</th>
                    {isAdmin && <th>Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {searchIkm.trim() === '' ? (
                    <tr>
                      <td colSpan={isAdmin ? 5 : 4} style={{ textAlign: 'center', padding: '24px', color: 'var(--mute)' }}>
                        Masukkan nama mahasiswa untuk mencari data.
                      </td>
                    </tr>
                  ) : loadingIkm ? (
                    <tr>
                      <td colSpan={isAdmin ? 5 : 4} style={{ textAlign: 'center', padding: '24px', color: 'var(--mute)' }}>
                        Mencari data...
                      </td>
                    </tr>
                  ) : errorIkm ? (
                    <tr>
                      <td colSpan={isAdmin ? 5 : 4} style={{ textAlign: 'center', padding: '24px', color: 'var(--status-error)', fontWeight: '700' }}>
                        Gagal memuat data: {errorIkm}
                      </td>
                    </tr>
                  ) : ikmData.length > 0 ? (
                    ikmData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.nama}</td>
                        <td>{item.jurusan}</td>
                        <td>
                          {isAdmin && editingIkmId === item.id ? (
                            <input 
                              type="number" 
                              step="0.01"
                              className="nilai-input" 
                              value={editingNilai} 
                              onChange={(e) => setEditingNilai(e.target.value)} 
                            />
                          ) : (
                            item.nilai
                          )}
                        </td>
                        <td>
                          {item.status === 'AKTIF' ? (
                            <span className="status-highlight-aktif">AKTIF</span>
                          ) : (
                            <span className="status-highlight-pasif">PASIF</span>
                          )}
                        </td>
                        {isAdmin && (
                          <td>
                            <div className="action-cell">
                              {editingIkmId === item.id ? (
                                <>
                                  <button className="btn-edit" onClick={() => handleSaveIkm(item)} disabled={updatingIkm}>
                                    {updatingIkm ? 'Menyimpan...' : 'Simpan'}
                                  </button>
                                  <button className="btn-delete" onClick={handleCancelEditIkm} disabled={updatingIkm}>Batal</button>
                                </>
                              ) : (
                                <button className="btn-edit" onClick={() => handleEditIkm(item)}>Edit Nilai</button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isAdmin ? 5 : 4} style={{ textAlign: 'center', padding: '24px', color: 'var(--mute)' }}>Data tidak ditemukan.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : showAboutUs ? (
        <div className="page-peraturan-container">
          <section className="section">
            <button className="btn-back" onClick={goBack}>← Kembali ke Beranda</button>
            <div className="section-header">
              <h2>About Us</h2>
              <p>Kepengurusan Badan Perwakilan Mahasiswa FIA UI</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '500px', padding: '40px 0' }}>
              <ImageSwiper />
            </div>
          </section>
        </div>
      ) : selectedPeraturan ? (
        <div className="page-peraturan-container">
          <section className="section">
            <button className="btn-back" onClick={goBack}>← Kembali ke Daftar Peraturan</button>
            <div className="detail-layout">
              <h1 className="detail-title">{selectedPeraturan.judul}</h1>
              <div className="info-box">
                <div className="info-row"><div className="info-label">Judul</div><div className="info-value">{selectedPeraturan.judul}</div></div>
                <div className="info-row"><div className="info-label">Jenis Dokumen</div><div className="info-value">{selectedPeraturan.jenisDokumen}</div></div>
                <div className="info-row"><div className="info-label">Tahun</div><div className="info-value">{selectedPeraturan.tahun}</div></div>
                <div className="info-row"><div className="info-label">Tanggal Penetapan</div><div className="info-value">{selectedPeraturan.tglPenetapan}</div></div>
                <div className="info-row"><div className="info-label">Tempat Penetapan</div><div className="info-value">{selectedPeraturan.tempatPenetapan}</div></div>
                <div className="info-row"><div className="info-label">Tanggal Berlaku</div><div className="info-value">{selectedPeraturan.tglBerlaku}</div></div>
                <div className="info-row">
                  <div className="info-label">Status</div>
                  <div className="info-value">
                    <span className={`status-badge ${selectedPeraturan.status === 'Berlaku' ? 'status-berlaku' : selectedPeraturan.status === 'Dicabut' ? 'status-dicabut' : 'status-tidak-berlaku'}`}>{selectedPeraturan.status}</span>
                  </div>
                </div>
              </div>

              <div className="action-buttons">
                <button className="action-btn primary">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/></svg>
                  View Document
                </button>
                <button className="action-btn outline">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/></svg>
                  Download
                </button>
                <button className="action-btn outline">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.847-8.605a.5.5 0 1 0-.866-.5l-2 3.464a.5.5 0 0 0 .866.5l2-3.464z"/><path d="M4.5 3a.5.5 0 0 0-.5.5V6H2a.5.5 0 0 0 0 1h2.5a.5.5 0 0 0 .5-.5V3.5a.5.5 0 0 0-.5-.5z"/></svg>
                  Riwayat
                </button>
              </div>

              <h2 className="sub-heading">Peraturan Terbaru yang Mengubah</h2>
              {selectedPeraturan.perubahanTerkini.length > 0 ? (
                <div className="table-responsive">
                  <table className="amendment-table">
                    <thead><tr><th>Nomor Peraturan</th><th>Judul Peraturan</th></tr></thead>
                    <tbody>
                      {selectedPeraturan.perubahanTerkini.map((amandemen: any, index: number) => (
                        <tr key={index}><td>{amandemen.nomor}</td><td>{amandemen.judul}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: 'var(--mute)', marginBottom: '48px', fontSize: '15px' }}>Belum ada peraturan perubahan untuk dokumen ini.</p>
              )}
            </div>
          </section>
        </div>
      ) : (
        <div className="page-peraturan-container">
          <section className="section">
            <button className="btn-back" onClick={goToHome}>← Kembali ke Beranda</button>
            <div className="section-header">
              <h2>Semua Peraturan</h2>
              <p>Daftar lengkap regulasi dan peraturan yang dikeluarkan oleh BPM FIA UI</p>
            </div>
            <div className="cards-grid">
              {peraturanData.map((item) => (
                <div className="card" key={item.id}>
                  <div className="card-header">
                    <span>Peraturan</span>
                    <span className="card-date">{formatTanggal(item.tglPenetapan)}</span>
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{item.judul}</h3>
                    <button className="btn-outline" onClick={() => viewDetail(item)}>View</button>
                    {isAdmin && (
                      <div className="card-actions">
                        <button className="btn-edit" onClick={() => openEditForm(item)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDelete(item.id)}>Hapus</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      <footer className="footer" id="kontak">
        <div className="footer-grid">
          <div className="footer-about">
            <h3>BPM FIA UI</h3>
            <p>Badan Perwakilan Mahasiswa Fakultas Ilmu Administrasi Universitas Indonesia merupakan lembaga perwakilan mahasiswa yang berfungsi sebagai legislator, aspirator, dan kontrol terhadap lembaga eksekutif mahasiswa.</p>
            <div className="social-links">
              <a href="https://www.instagram.com/bpmfiaui?igsh=ZHlraXVuMjR6eHE0" target="_blank" rel="noopener noreferrer" title="Instagram">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://x.com/BPMFIAUI" target="_blank" rel="noopener noreferrer" title="X / Twitter">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://lin.ee/pteZwX4" target="_blank" rel="noopener noreferrer" title="Line">
                <img src={lineLogo.src} alt="Line" width="20" height="20" style={{ filter: 'brightness(0) invert(1)' }} />
              </a>
            </div>
          </div>
          <div className="footer-links">
            <h4>Navigasi</h4>
            <ul>
              <li><a onClick={goToHome}>Beranda</a></li>
              <li><a onClick={goToAllPeraturan}>Peraturan</a></li>
              <li><a onClick={goToAboutUs}>About Us</a></li>
              <li><a onClick={goToStatusIkm}>Cek Status IKM</a></li>
              <li><a onClick={goToBerita}>Berita</a></li>
              <li><a onClick={goToKontak}>Kontak</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Kontak</h4>
            <ul>
              <li><a href="https://maps.app.goo.gl/EXW9DaKNgcBmMQ9p9" target="_blank" rel="noopener noreferrer">Gedung M FIA UI, Depok</a></li>
              <li><a href="https://maps.app.goo.gl/J6nVMzbrYQbwysQCA" target="_blank" rel="noopener noreferrer">Gedung Baru FIA UI</a></li>
              <li><a href="mailto:reformasibpmfiaui@gmail.com">reformasibpmfiaui@gmail.com</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">BPM FIA UI</div>
      </footer>
    </>
  );
}