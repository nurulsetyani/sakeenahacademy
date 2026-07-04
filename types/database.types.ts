// Hand-authored to mirror supabase/migrations/*.sql exactly (no Supabase CLI available in this
// environment to run `supabase gen types typescript`). Regenerate with that command once the
// project is linked, and this file becomes redundant.
//
// `Relationships: []` is left empty on every table (real generated types populate this with FK
// metadata used for typed `!fkey` embeds). Embedded/joined selects below still work correctly at
// runtime via PostgREST — they're just not deeply typed, and are cast where consumed.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: Database["public"]["Enums"]["user_role"];
          phone: string;
          avatar_url: string | null;
          gender: Database["public"]["Enums"]["gender_type"] | null;
          date_of_birth: string | null;
          address: string | null;
          account_status: Database["public"]["Enums"]["account_status"];
          bio: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id: string;
          full_name: string;
          role?: Database["public"]["Enums"]["user_role"];
          phone: string;
          avatar_url?: string | null;
          gender?: Database["public"]["Enums"]["gender_type"] | null;
          date_of_birth?: string | null;
          address?: string | null;
          account_status?: Database["public"]["Enums"]["account_status"];
          bio?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      course_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["course_categories"]["Insert"]>;
        Relationships: [];
      };
      courses: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          cover_image_url: string | null;
          category_id: string | null;
          teacher_id: string;
          program_type: Database["public"]["Enums"]["program_type"];
          access_type: Database["public"]["Enums"]["course_access_type"];
          price: number;
          status: Database["public"]["Enums"]["course_status"];
          passing_grade: number | null;
          completion_rule: Database["public"]["Enums"]["completion_rule"];
          level: Database["public"]["Enums"]["course_level"];
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          cover_image_url?: string | null;
          category_id?: string | null;
          teacher_id: string;
          program_type?: Database["public"]["Enums"]["program_type"];
          access_type?: Database["public"]["Enums"]["course_access_type"];
          price?: number;
          status?: Database["public"]["Enums"]["course_status"];
          passing_grade?: number | null;
          completion_rule?: Database["public"]["Enums"]["completion_rule"];
          level?: Database["public"]["Enums"]["course_level"];
        };
        Update: Partial<Database["public"]["Tables"]["courses"]["Insert"]>;
        Relationships: [];
      };
      course_modules: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          order_index?: number;
        };
        Update: Partial<Database["public"]["Tables"]["course_modules"]["Insert"]>;
        Relationships: [];
      };
      lessons: {
        Row: {
          id: string;
          course_id: string;
          module_id: string | null;
          title: string;
          youtube_url: string | null;
          pdf_url: string | null;
          summary_content: string | null;
          order_index: number;
          status: Database["public"]["Enums"]["content_status"];
          estimated_duration_minutes: number | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          course_id: string;
          module_id?: string | null;
          title: string;
          youtube_url?: string | null;
          pdf_url?: string | null;
          summary_content?: string | null;
          order_index?: number;
          status?: Database["public"]["Enums"]["content_status"];
          estimated_duration_minutes?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["lessons"]["Insert"]>;
        Relationships: [];
      };
      quizzes: {
        Row: {
          id: string;
          course_id: string;
          lesson_id: string | null;
          title: string;
          quiz_type: Database["public"]["Enums"]["quiz_type"];
          passing_grade: number;
          time_limit_minutes: number | null;
          max_attempts: number;
          status: Database["public"]["Enums"]["content_status"];
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          course_id: string;
          lesson_id?: string | null;
          title: string;
          quiz_type: Database["public"]["Enums"]["quiz_type"];
          passing_grade?: number;
          time_limit_minutes?: number | null;
          max_attempts?: number;
          status?: Database["public"]["Enums"]["content_status"];
        };
        Update: Partial<Database["public"]["Tables"]["quizzes"]["Insert"]>;
        Relationships: [];
      };
      quiz_questions: {
        Row: {
          id: string;
          quiz_id: string;
          question_text: string;
          question_type: Database["public"]["Enums"]["question_type"];
          points: number;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          question_text: string;
          question_type: Database["public"]["Enums"]["question_type"];
          points?: number;
          order_index?: number;
        };
        Update: Partial<Database["public"]["Tables"]["quiz_questions"]["Insert"]>;
        Relationships: [];
      };
      quiz_options: {
        Row: {
          id: string;
          question_id: string;
          option_text: string;
          is_correct: boolean;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          option_text: string;
          is_correct?: boolean;
          order_index?: number;
        };
        Update: Partial<Database["public"]["Tables"]["quiz_options"]["Insert"]>;
        Relationships: [];
      };
      quiz_attempt_grants: {
        Row: {
          id: string;
          quiz_id: string;
          student_id: string;
          granted_by: string;
          extra_attempts: number;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          student_id: string;
          granted_by: string;
          extra_attempts?: number;
          reason?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["quiz_attempt_grants"]["Insert"]>;
        Relationships: [];
      };
      quiz_attempts: {
        Row: {
          id: string;
          quiz_id: string;
          student_id: string;
          attempt_number: number;
          score: number | null;
          status: Database["public"]["Enums"]["attempt_status"];
          started_at: string;
          submitted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          student_id: string;
          score?: number | null;
          status?: Database["public"]["Enums"]["attempt_status"];
        };
        Update: Partial<Database["public"]["Tables"]["quiz_attempts"]["Insert"]>;
        Relationships: [];
      };
      quiz_attempt_answers: {
        Row: {
          id: string;
          attempt_id: string;
          question_id: string;
          selected_option_id: string | null;
          is_correct: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          attempt_id: string;
          question_id: string;
          selected_option_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["quiz_attempt_answers"]["Insert"]>;
        Relationships: [];
      };
      enrollments: {
        Row: {
          id: string;
          student_id: string;
          course_id: string;
          status: Database["public"]["Enums"]["enrollment_status"];
          enrolled_at: string | null;
          completed_at: string | null;
          progress_percentage: number;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          student_id: string;
          course_id: string;
          status?: Database["public"]["Enums"]["enrollment_status"];
        };
        Update: Partial<Database["public"]["Tables"]["enrollments"]["Insert"]>;
        Relationships: [];
      };
      lesson_progress: {
        Row: {
          id: string;
          enrollment_id: string;
          lesson_id: string;
          status: Database["public"]["Enums"]["progress_status"];
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          enrollment_id: string;
          lesson_id: string;
          status?: Database["public"]["Enums"]["progress_status"];
          completed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["lesson_progress"]["Insert"]>;
        Relationships: [];
      };
      live_sessions: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          platform: Database["public"]["Enums"]["meeting_platform"];
          meeting_link: string | null;
          scheduled_at: string;
          duration_minutes: number;
          recording_url: string | null;
          status: Database["public"]["Enums"]["session_status"];
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          platform: Database["public"]["Enums"]["meeting_platform"];
          meeting_link?: string | null;
          scheduled_at: string;
          duration_minutes?: number;
          recording_url?: string | null;
          status?: Database["public"]["Enums"]["session_status"];
        };
        Update: Partial<Database["public"]["Tables"]["live_sessions"]["Insert"]>;
        Relationships: [];
      };
      live_session_attendance: {
        Row: {
          id: string;
          session_id: string;
          student_id: string;
          status: Database["public"]["Enums"]["attendance_status"];
          checked_in_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          student_id: string;
          status?: Database["public"]["Enums"]["attendance_status"];
          checked_in_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["live_session_attendance"]["Insert"]>;
        Relationships: [];
      };
      tahsin_schedules: {
        Row: {
          id: string;
          course_id: string;
          teacher_id: string;
          session_date: string;
          start_time: string;
          end_time: string;
          location_or_link: string | null;
          status: Database["public"]["Enums"]["session_status"];
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          course_id: string;
          teacher_id: string;
          session_date: string;
          start_time: string;
          end_time: string;
          location_or_link?: string | null;
          status?: Database["public"]["Enums"]["session_status"];
        };
        Update: Partial<Database["public"]["Tables"]["tahsin_schedules"]["Insert"]>;
        Relationships: [];
      };
      tahsin_attendance: {
        Row: {
          id: string;
          schedule_id: string;
          student_id: string;
          status: Database["public"]["Enums"]["attendance_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          schedule_id: string;
          student_id: string;
          status?: Database["public"]["Enums"]["attendance_status"];
        };
        Update: Partial<Database["public"]["Tables"]["tahsin_attendance"]["Insert"]>;
        Relationships: [];
      };
      tahsin_assessments: {
        Row: {
          id: string;
          schedule_id: string;
          student_id: string;
          teacher_id: string;
          makhraj_score: number | null;
          tajwid_score: number | null;
          kelancaran_score: number | null;
          overall_grade: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          schedule_id: string;
          student_id: string;
          teacher_id: string;
          makhraj_score?: number | null;
          tajwid_score?: number | null;
          kelancaran_score?: number | null;
          overall_grade?: string | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["tahsin_assessments"]["Insert"]>;
        Relationships: [];
      };
      tahfidz_targets: {
        Row: {
          id: string;
          course_id: string;
          student_id: string;
          assigned_by: string;
          surah: string;
          ayat_start: number;
          ayat_end: number;
          target_date: string | null;
          status: Database["public"]["Enums"]["target_status"];
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          course_id: string;
          student_id: string;
          assigned_by: string;
          surah: string;
          ayat_start: number;
          ayat_end: number;
          target_date?: string | null;
          status?: Database["public"]["Enums"]["target_status"];
        };
        Update: Partial<Database["public"]["Tables"]["tahfidz_targets"]["Insert"]>;
        Relationships: [];
      };
      tahfidz_setoran: {
        Row: {
          id: string;
          course_id: string;
          student_id: string;
          teacher_id: string;
          target_id: string | null;
          surah: string;
          ayat_start: number;
          ayat_end: number;
          setoran_date: string;
          status: Database["public"]["Enums"]["setoran_status"];
          score: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          course_id: string;
          student_id: string;
          teacher_id: string;
          target_id?: string | null;
          surah: string;
          ayat_start: number;
          ayat_end: number;
          setoran_date?: string;
          status?: Database["public"]["Enums"]["setoran_status"];
          score?: number | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["tahfidz_setoran"]["Insert"]>;
        Relationships: [];
      };
      certificate_templates: {
        Row: {
          id: string;
          name: string;
          category_id: string | null;
          design_config: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category_id?: string | null;
          design_config?: Json;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["certificate_templates"]["Insert"]>;
        Relationships: [];
      };
      certificates: {
        Row: {
          id: string;
          certificate_number: string;
          enrollment_id: string;
          student_id: string;
          course_id: string;
          template_id: string;
          issued_at: string;
          qr_token: string;
          pdf_url: string | null;
          status: Database["public"]["Enums"]["certificate_status"];
          created_at: string;
          updated_at: string;
        };
        // Hanya ditulis oleh trigger issue_certificate_for_enrollment() (SECURITY DEFINER) —
        // tidak ada RLS insert policy untuk client, tapi tetap perlu bentuk objek yang valid
        // (bukan `never`) agar GenericTable dari postgrest-js ter-satisfy dengan benar.
        Insert: {
          id?: string;
          certificate_number: string;
          enrollment_id: string;
          student_id: string;
          course_id: string;
          template_id: string;
          issued_at?: string;
          qr_token?: string;
          pdf_url?: string | null;
          status?: Database["public"]["Enums"]["certificate_status"];
        };
        Update: {
          status?: Database["public"]["Enums"]["certificate_status"];
          pdf_url?: string | null;
        };
        Relationships: [];
      };
      payment_channels: {
        Row: {
          id: string;
          type: Database["public"]["Enums"]["payment_channel_type"];
          bank_name: string | null;
          account_number: string | null;
          account_holder: string | null;
          qris_image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: Database["public"]["Enums"]["payment_channel_type"];
          bank_name?: string | null;
          account_number?: string | null;
          account_holder?: string | null;
          qris_image_url?: string | null;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["payment_channels"]["Insert"]>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          enrollment_id: string;
          student_id: string;
          course_id: string;
          attempt_number: number;
          amount: number;
          channel_id: string | null;
          proof_image_url: string | null;
          status: Database["public"]["Enums"]["payment_status"];
          submitted_at: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          enrollment_id: string;
          student_id: string;
          course_id: string;
          amount: number;
          channel_id?: string | null;
          proof_image_url?: string | null;
          status?: Database["public"]["Enums"]["payment_status"];
          submitted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]> & {
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: Database["public"]["Enums"]["notification_type"];
          title: string;
          body: string | null;
          link_url: string | null;
          is_read: boolean;
          sent_at: string;
          channel: Database["public"]["Enums"]["notification_channel"];
          created_at: string;
          updated_at: string;
        };
        // Normalnya hanya ditulis sistem (SECURITY DEFINER functions), tapi migration 000014
        // menambahkan policy notifications_admin_insert agar admin.ts (approve/reject guru &
        // pembayaran) bisa menulis langsung — lihat catatan di file itu.
        Insert: {
          id?: string;
          user_id: string;
          type: Database["public"]["Enums"]["notification_type"];
          title: string;
          body?: string | null;
          link_url?: string | null;
          is_read?: boolean;
          sent_at?: string;
          channel?: Database["public"]["Enums"]["notification_channel"];
        };
        Update: {
          is_read?: boolean;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      submit_quiz_attempt: {
        Args: { p_attempt_id: string };
        Returns: Database["public"]["Tables"]["quiz_attempts"]["Row"];
      };
      get_quiz_for_attempt: {
        Args: { p_quiz_id: string };
        Returns: {
          question_id: string;
          question_text: string;
          question_type: Database["public"]["Enums"]["question_type"];
          points: number;
          question_order: number;
          option_id: string | null;
          option_text: string | null;
          option_order: number | null;
        }[];
      };
      verify_certificate: {
        Args: { p_identifier: string };
        Returns: {
          certificate_number: string;
          student_name: string;
          course_title: string;
          issued_at: string;
          status: Database["public"]["Enums"]["certificate_status"];
        }[];
      };
    };
    Enums: {
      user_role: "murid" | "guru" | "admin";
      account_status: "pending" | "active" | "suspended";
      gender_type: "laki_laki" | "perempuan";
      program_type: "reguler" | "tahsin" | "tahfidz";
      course_access_type: "gratis" | "berbayar";
      course_status: "draft" | "published" | "archived";
      course_level: "pemula" | "menengah" | "lanjutan";
      completion_rule: "seluruh_materi" | "ujian_akhir" | "keduanya";
      content_status: "draft" | "published";
      quiz_type: "quiz_materi" | "ujian_akhir";
      question_type: "pilihan_tunggal" | "pilihan_ganda" | "benar_salah";
      attempt_status: "berjalan" | "lulus" | "tidak_lulus";
      enrollment_status: "pending_payment" | "active" | "completed" | "rejected" | "expired";
      progress_status: "belum_mulai" | "berjalan" | "selesai";
      meeting_platform: "zoom" | "google_meet";
      session_status: "terjadwal" | "berlangsung" | "selesai" | "dibatalkan";
      attendance_status: "hadir" | "tidak_hadir" | "izin" | "sakit";
      target_status: "belum_mulai" | "proses" | "selesai";
      setoran_status: "lancar" | "perlu_perbaikan" | "mengulang";
      certificate_status: "aktif" | "revoked";
      payment_channel_type: "transfer_bank" | "qris";
      payment_status: "pending" | "menunggu_verifikasi" | "approved" | "rejected";
      notification_type:
        | "materi_baru"
        | "jadwal_kelas"
        | "reminder_kelas"
        | "reminder_quiz"
        | "reminder_ujian"
        | "sertifikat_tersedia"
        | "reminder_pembayaran"
        | "payment_approved"
        | "payment_rejected"
        | "guru_disetujui"
        | "guru_ditolak";
      notification_channel: "in_app" | "whatsapp";
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];
