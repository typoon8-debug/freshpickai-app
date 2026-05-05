export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      ad_campaign: {
        Row: {
          campaign_id: string;
          created_at: string;
          end_at: string;
          modified_at: string;
          name: string;
          placement_id: string;
          slide_count: number;
          slide_interval: number;
          start_at: string;
          status: string;
          store_id: string;
        };
        Insert: {
          campaign_id?: string;
          created_at?: string;
          end_at: string;
          modified_at?: string;
          name: string;
          placement_id?: string;
          slide_count?: number;
          slide_interval?: number;
          start_at: string;
          status?: string;
          store_id: string;
        };
        Update: {
          campaign_id?: string;
          created_at?: string;
          end_at?: string;
          modified_at?: string;
          name?: string;
          placement_id?: string;
          slide_count?: number;
          slide_interval?: number;
          start_at?: string;
          status?: string;
          store_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ad_campaign_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      ad_campaign_item: {
        Row: {
          ad_image: string;
          campaign_id: string;
          campaign_item_id: string;
          click_count: number;
          created_at: string;
          slide_order: number;
          store_item_id: string;
          subtitle: string | null;
          title: string | null;
        };
        Insert: {
          ad_image: string;
          campaign_id: string;
          campaign_item_id?: string;
          click_count?: number;
          created_at?: string;
          slide_order: number;
          store_item_id: string;
          subtitle?: string | null;
          title?: string | null;
        };
        Update: {
          ad_image?: string;
          campaign_id?: string;
          campaign_item_id?: string;
          click_count?: number;
          created_at?: string;
          slide_order?: number;
          store_item_id?: string;
          subtitle?: string | null;
          title?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ad_campaign_item_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "ad_campaign";
            referencedColumns: ["campaign_id"];
          },
          {
            foreignKeyName: "ad_campaign_item_store_item_id_fkey";
            columns: ["store_item_id"];
            isOneToOne: false;
            referencedRelation: "store_item";
            referencedColumns: ["store_item_id"];
          },
          {
            foreignKeyName: "ad_campaign_item_store_item_id_fkey";
            columns: ["store_item_id"];
            isOneToOne: false;
            referencedRelation: "v_store_inventory_item";
            referencedColumns: ["store_item_id"];
          },
          {
            foreignKeyName: "ad_campaign_item_store_item_id_fkey";
            columns: ["store_item_id"];
            isOneToOne: false;
            referencedRelation: "v_store_item";
            referencedColumns: ["store_item_id"];
          },
        ];
      };
      ad_cap: {
        Row: {
          cap_id: string;
          content_id: string;
          created_at: string;
          max_clicks_total: number | null;
          max_impressions_per_user_day: number | null;
          max_impressions_total: number | null;
          status: string;
          store_id: string;
          updated_at: string;
        };
        Insert: {
          cap_id?: string;
          content_id: string;
          created_at?: string;
          max_clicks_total?: number | null;
          max_impressions_per_user_day?: number | null;
          max_impressions_total?: number | null;
          status?: string;
          store_id: string;
          updated_at?: string;
        };
        Update: {
          cap_id?: string;
          content_id?: string;
          created_at?: string;
          max_clicks_total?: number | null;
          max_impressions_per_user_day?: number | null;
          max_impressions_total?: number | null;
          status?: string;
          store_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fp_ad_cap_content_id_fkey";
            columns: ["content_id"];
            isOneToOne: false;
            referencedRelation: "ad_content";
            referencedColumns: ["content_id"];
          },
          {
            foreignKeyName: "fp_ad_cap_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      ad_content: {
        Row: {
          ad_image: string | null;
          click_url: string | null;
          content_id: string;
          created_at: string;
          placement_id: string;
          priority: number;
          status: string;
          store_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          ad_image?: string | null;
          click_url?: string | null;
          content_id?: string;
          created_at?: string;
          placement_id: string;
          priority?: number;
          status?: string;
          store_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          ad_image?: string | null;
          click_url?: string | null;
          content_id?: string;
          created_at?: string;
          placement_id?: string;
          priority?: number;
          status?: string;
          store_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fp_ad_content_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      ad_log: {
        Row: {
          action: string;
          area_key: string;
          campaign_id: string | null;
          campaign_item_id: string | null;
          content_id: string | null;
          device_id: string | null;
          ip: string | null;
          item_id: string | null;
          log_id: string;
          page: string;
          store_id: string;
          ts: string;
          ua: string | null;
          user_id: string | null;
        };
        Insert: {
          action: string;
          area_key: string;
          campaign_id?: string | null;
          campaign_item_id?: string | null;
          content_id?: string | null;
          device_id?: string | null;
          ip?: string | null;
          item_id?: string | null;
          log_id?: string;
          page: string;
          store_id: string;
          ts?: string;
          ua?: string | null;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          area_key?: string;
          campaign_id?: string | null;
          campaign_item_id?: string | null;
          content_id?: string | null;
          device_id?: string | null;
          ip?: string | null;
          item_id?: string | null;
          log_id?: string;
          page?: string;
          store_id?: string;
          ts?: string;
          ua?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ad_log_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "ad_campaign";
            referencedColumns: ["campaign_id"];
          },
          {
            foreignKeyName: "ad_log_campaign_item_id_fkey";
            columns: ["campaign_item_id"];
            isOneToOne: false;
            referencedRelation: "ad_campaign_item";
            referencedColumns: ["campaign_item_id"];
          },
          {
            foreignKeyName: "fp_ad_log_content_id_fkey";
            columns: ["content_id"];
            isOneToOne: false;
            referencedRelation: "ad_content";
            referencedColumns: ["content_id"];
          },
          {
            foreignKeyName: "fp_ad_log_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      ad_schedule: {
        Row: {
          content_id: string;
          dow_mask: string | null;
          end_at: string;
          schedule_id: string;
          start_at: string;
          status: string;
          store_id: string;
          time_end: string | null;
          time_start: string | null;
          timezone: string | null;
          weight: number | null;
        };
        Insert: {
          content_id: string;
          dow_mask?: string | null;
          end_at: string;
          schedule_id?: string;
          start_at: string;
          status?: string;
          store_id: string;
          time_end?: string | null;
          time_start?: string | null;
          timezone?: string | null;
          weight?: number | null;
        };
        Update: {
          content_id?: string;
          dow_mask?: string | null;
          end_at?: string;
          schedule_id?: string;
          start_at?: string;
          status?: string;
          store_id?: string;
          time_end?: string | null;
          time_start?: string | null;
          timezone?: string | null;
          weight?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "fp_ad_schedule_content_id_fkey";
            columns: ["content_id"];
            isOneToOne: false;
            referencedRelation: "ad_content";
            referencedColumns: ["content_id"];
          },
          {
            foreignKeyName: "fp_ad_schedule_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      ad_target: {
        Row: {
          app_version_max: string | null;
          app_version_min: string | null;
          content_id: string;
          locale: string | null;
          os: string | null;
          region: string | null;
          status: string;
          store_id: string;
          target_id: string;
          user_segment: string | null;
        };
        Insert: {
          app_version_max?: string | null;
          app_version_min?: string | null;
          content_id: string;
          locale?: string | null;
          os?: string | null;
          region?: string | null;
          status?: string;
          store_id: string;
          target_id?: string;
          user_segment?: string | null;
        };
        Update: {
          app_version_max?: string | null;
          app_version_min?: string | null;
          content_id?: string;
          locale?: string | null;
          os?: string | null;
          region?: string | null;
          status?: string;
          store_id?: string;
          target_id?: string;
          user_segment?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fp_ad_target_content_id_fkey";
            columns: ["content_id"];
            isOneToOne: false;
            referencedRelation: "ad_content";
            referencedColumns: ["content_id"];
          },
          {
            foreignKeyName: "fp_ad_target_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      address: {
        Row: {
          addr_detail: string | null;
          address: string;
          address_id: string;
          address_name: string;
          created_at: string;
          customer_id: string;
          geocoded_at: string | null;
          lat: number | null;
          lng: number | null;
          message: string;
          modified_at: string;
          receiver_name: string | null;
          receiver_phone: string | null;
          status: string;
          zipcode: string | null;
        };
        Insert: {
          addr_detail?: string | null;
          address: string;
          address_id?: string;
          address_name: string;
          created_at?: string;
          customer_id: string;
          geocoded_at?: string | null;
          lat?: number | null;
          lng?: number | null;
          message?: string;
          modified_at?: string;
          receiver_name?: string | null;
          receiver_phone?: string | null;
          status?: string;
          zipcode?: string | null;
        };
        Update: {
          addr_detail?: string | null;
          address?: string;
          address_id?: string;
          address_name?: string;
          created_at?: string;
          customer_id?: string;
          geocoded_at?: string | null;
          lat?: number | null;
          lng?: number | null;
          message?: string;
          modified_at?: string;
          receiver_name?: string | null;
          receiver_phone?: string | null;
          status?: string;
          zipcode?: string | null;
        };
        Relationships: [];
      };
      assignment: {
        Row: {
          accepted_at: string | null;
          assignment_id: string;
          created_at: string;
          delivered_at: string | null;
          distance_km: number | null;
          out_at: string | null;
          picked_up_at: string | null;
          rider_id: string;
          shipment_id: string;
          status: Database["public"]["Enums"]["assignment_status"];
          updated_at: string;
        };
        Insert: {
          accepted_at?: string | null;
          assignment_id?: string;
          created_at?: string;
          delivered_at?: string | null;
          distance_km?: number | null;
          out_at?: string | null;
          picked_up_at?: string | null;
          rider_id: string;
          shipment_id: string;
          status?: Database["public"]["Enums"]["assignment_status"];
          updated_at?: string;
        };
        Update: {
          accepted_at?: string | null;
          assignment_id?: string;
          created_at?: string;
          delivered_at?: string | null;
          distance_km?: number | null;
          out_at?: string | null;
          picked_up_at?: string | null;
          rider_id?: string;
          shipment_id?: string;
          status?: Database["public"]["Enums"]["assignment_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assignment_rider_id_fkey";
            columns: ["rider_id"];
            isOneToOne: false;
            referencedRelation: "rider";
            referencedColumns: ["rider_id"];
          },
          {
            foreignKeyName: "assignment_shipment_id_fkey";
            columns: ["shipment_id"];
            isOneToOne: false;
            referencedRelation: "shipment";
            referencedColumns: ["shipment_id"];
          },
        ];
      };
      audit_log: {
        Row: {
          action: string;
          created_at: string;
          ip: string | null;
          log_id: string;
          payload: Json | null;
          resource: string;
          tenant_user_id: number | null;
          user_id: string | null;
        };
        Insert: {
          action: string;
          created_at?: string;
          ip?: string | null;
          log_id?: string;
          payload?: Json | null;
          resource: string;
          tenant_user_id?: number | null;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string;
          ip?: string | null;
          log_id?: string;
          payload?: Json | null;
          resource?: string;
          tenant_user_id?: number | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_log_tenant_user_id_fkey";
            columns: ["tenant_user_id"];
            isOneToOne: false;
            referencedRelation: "tenant_user";
            referencedColumns: ["id"];
          },
        ];
      };
      bank_account_verify_log: {
        Row: {
          account_holder: string;
          account_no: string;
          bank_code: string;
          bank_name: string;
          created_at: string;
          response_code: string | null;
          response_message: string | null;
          user_id: string | null;
          verified: boolean;
          verified_at: string | null;
          verify_id: string;
        };
        Insert: {
          account_holder: string;
          account_no: string;
          bank_code: string;
          bank_name: string;
          created_at?: string;
          response_code?: string | null;
          response_message?: string | null;
          user_id?: string | null;
          verified?: boolean;
          verified_at?: string | null;
          verify_id?: string;
        };
        Update: {
          account_holder?: string;
          account_no?: string;
          bank_code?: string;
          bank_name?: string;
          created_at?: string;
          response_code?: string | null;
          response_message?: string | null;
          user_id?: string | null;
          verified?: boolean;
          verified_at?: string | null;
          verify_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bank_account_verify_log_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
        ];
      };
      cart: {
        Row: {
          cart_id: string;
          cartId: string;
          created_at: string;
          customer_id: string;
          item_option_id: string | null;
          modified_at: string;
          order_id: string | null;
          quantity: number;
          status: string;
          store_id: string;
          store_item_id: string;
        };
        Insert: {
          cart_id?: string;
          cartId?: string;
          created_at?: string;
          customer_id: string;
          item_option_id?: string | null;
          modified_at?: string;
          order_id?: string | null;
          quantity?: number;
          status?: string;
          store_id: string;
          store_item_id: string;
        };
        Update: {
          cart_id?: string;
          cartId?: string;
          created_at?: string;
          customer_id?: string;
          item_option_id?: string | null;
          modified_at?: string;
          order_id?: string | null;
          quantity?: number;
          status?: string;
          store_id?: string;
          store_item_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cart_store_item_id_fkey";
            columns: ["store_item_id"];
            isOneToOne: false;
            referencedRelation: "store_item";
            referencedColumns: ["store_item_id"];
          },
          {
            foreignKeyName: "cart_store_item_id_fkey";
            columns: ["store_item_id"];
            isOneToOne: false;
            referencedRelation: "v_store_inventory_item";
            referencedColumns: ["store_item_id"];
          },
          {
            foreignKeyName: "cart_store_item_id_fkey";
            columns: ["store_item_id"];
            isOneToOne: false;
            referencedRelation: "v_store_item";
            referencedColumns: ["store_item_id"];
          },
        ];
      };
      cart_item: {
        Row: {
          cart_id: string;
          cart_item_id: string;
          created_at: string;
          item_option_id: string | null;
          modified_at: string;
          quantity: number;
          status: string;
          store_item_id: string;
        };
        Insert: {
          cart_id: string;
          cart_item_id?: string;
          created_at?: string;
          item_option_id?: string | null;
          modified_at?: string;
          quantity?: number;
          status?: string;
          store_item_id: string;
        };
        Update: {
          cart_id?: string;
          cart_item_id?: string;
          created_at?: string;
          item_option_id?: string | null;
          modified_at?: string;
          quantity?: number;
          status?: string;
          store_item_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cart_item_cart_id_fkey";
            columns: ["cart_id"];
            isOneToOne: false;
            referencedRelation: "cart";
            referencedColumns: ["cart_id"];
          },
          {
            foreignKeyName: "cart_item_store_item_id_fkey";
            columns: ["store_item_id"];
            isOneToOne: false;
            referencedRelation: "store_item";
            referencedColumns: ["store_item_id"];
          },
          {
            foreignKeyName: "cart_item_store_item_id_fkey";
            columns: ["store_item_id"];
            isOneToOne: false;
            referencedRelation: "v_store_inventory_item";
            referencedColumns: ["store_item_id"];
          },
          {
            foreignKeyName: "cart_item_store_item_id_fkey";
            columns: ["store_item_id"];
            isOneToOne: false;
            referencedRelation: "v_store_item";
            referencedColumns: ["store_item_id"];
          },
        ];
      };
      category_code: {
        Row: {
          code: string;
          code_id: string;
          created_at: string;
          description: string | null;
          name: string;
          status: string;
        };
        Insert: {
          code: string;
          code_id?: string;
          created_at?: string;
          description?: string | null;
          name: string;
          status?: string;
        };
        Update: {
          code?: string;
          code_id?: string;
          created_at?: string;
          description?: string | null;
          name?: string;
          status?: string;
        };
        Relationships: [];
      };
      ceo_review: {
        Row: {
          ceo_reviewId: string;
          content: string | null;
          created_at: string;
          modified_at: string;
          reviewId: string;
          status: string;
        };
        Insert: {
          ceo_reviewId?: string;
          content?: string | null;
          created_at?: string;
          modified_at?: string;
          reviewId: string;
          status?: string;
        };
        Update: {
          ceo_reviewId?: string;
          content?: string | null;
          created_at?: string;
          modified_at?: string;
          reviewId?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ceo_review_reviewId_fkey";
            columns: ["reviewId"];
            isOneToOne: false;
            referencedRelation: "review";
            referencedColumns: ["review_id"];
          },
        ];
      };
      common_code: {
        Row: {
          code: string;
          created_at: string;
          description: string | null;
          id: string;
          name: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      common_code_value: {
        Row: {
          common_code_id: string;
          created_at: string;
          id: string;
          label: string;
          sort_order: number;
          value: string;
        };
        Insert: {
          common_code_id: string;
          created_at?: string;
          id?: string;
          label: string;
          sort_order?: number;
          value: string;
        };
        Update: {
          common_code_id?: string;
          created_at?: string;
          id?: string;
          label?: string;
          sort_order?: number;
          value?: string;
        };
        Relationships: [
          {
            foreignKeyName: "common_code_value_common_code_id_fkey";
            columns: ["common_code_id"];
            isOneToOne: false;
            referencedRelation: "common_code";
            referencedColumns: ["id"];
          },
        ];
      };
      consent: {
        Row: {
          agreed: boolean;
          agreed_at: string | null;
          consent_id: string;
          created_at: string;
          type: string;
          user_id: string;
          version: string | null;
        };
        Insert: {
          agreed?: boolean;
          agreed_at?: string | null;
          consent_id?: string;
          created_at?: string;
          type: string;
          user_id: string;
          version?: string | null;
        };
        Update: {
          agreed?: boolean;
          agreed_at?: string | null;
          consent_id?: string;
          created_at?: string;
          type?: string;
          user_id?: string;
          version?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "consent_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
        ];
      };
      coupon: {
        Row: {
          code: string;
          coupon_id: string;
          coupon_type: string;
          created_at: string;
          discount_unit: string;
          discount_value: number;
          min_order_amount: number;
          modified_at: string;
          name: string;
          per_customer_limit: number;
          shipping_max_free: number;
          stackable: number;
          status: string;
          store_id: string;
          total_issuable: number;
          valid_from: string;
          valid_to: string;
        };
        Insert: {
          code?: string;
          coupon_id?: string;
          coupon_type: string;
          created_at?: string;
          discount_unit: string;
          discount_value: number;
          min_order_amount?: number;
          modified_at?: string;
          name: string;
          per_customer_limit?: number;
          shipping_max_free?: number;
          stackable?: number;
          status?: string;
          store_id: string;
          total_issuable?: number;
          valid_from?: string;
          valid_to: string;
        };
        Update: {
          code?: string;
          coupon_id?: string;
          coupon_type?: string;
          created_at?: string;
          discount_unit?: string;
          discount_value?: number;
          min_order_amount?: number;
          modified_at?: string;
          name?: string;
          per_customer_limit?: number;
          shipping_max_free?: number;
          stackable?: number;
          status?: string;
          store_id?: string;
          total_issuable?: number;
          valid_from?: string;
          valid_to?: string;
        };
        Relationships: [
          {
            foreignKeyName: "coupon_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      coupon_issurance: {
        Row: {
          coupon_id: string;
          created_at: string;
          customer_id: string;
          expires_at: string | null;
          issuance_id: string;
          issued_at: string;
          issued_status: string;
          modified_at: string;
          status: string | null;
        };
        Insert: {
          coupon_id: string;
          created_at?: string;
          customer_id: string;
          expires_at?: string | null;
          issuance_id?: string;
          issued_at?: string;
          issued_status?: string;
          modified_at?: string;
          status?: string | null;
        };
        Update: {
          coupon_id?: string;
          created_at?: string;
          customer_id?: string;
          expires_at?: string | null;
          issuance_id?: string;
          issued_at?: string;
          issued_status?: string;
          modified_at?: string;
          status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "coupon_issurance_coupon_id_fkey";
            columns: ["coupon_id"];
            isOneToOne: false;
            referencedRelation: "coupon";
            referencedColumns: ["coupon_id"];
          },
          {
            foreignKeyName: "coupon_issurance_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customer";
            referencedColumns: ["customer_id"];
          },
        ];
      };
      coupon_redemption: {
        Row: {
          created_at: string;
          discount_amount: number;
          issuance_id: string;
          modified_at: string;
          order_id: string;
          redemption_id: string;
          status: string;
          used_at: string;
        };
        Insert: {
          created_at?: string;
          discount_amount: number;
          issuance_id: string;
          modified_at?: string;
          order_id: string;
          redemption_id?: string;
          status?: string;
          used_at?: string;
        };
        Update: {
          created_at?: string;
          discount_amount?: number;
          issuance_id?: string;
          modified_at?: string;
          order_id?: string;
          redemption_id?: string;
          status?: string;
          used_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "coupon_redemption_issuance_id_fkey";
            columns: ["issuance_id"];
            isOneToOne: false;
            referencedRelation: "coupon_issurance";
            referencedColumns: ["issuance_id"];
          },
          {
            foreignKeyName: "coupon_redemption_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "order";
            referencedColumns: ["order_id"];
          },
        ];
      };
      cs_ticket: {
        Row: {
          created_at: string;
          cs_action: string;
          cs_contents: string;
          customer_id: string;
          modified_at: string;
          order_id: string;
          status: string;
          ticket_id: string;
          type: string;
        };
        Insert: {
          created_at?: string;
          cs_action?: string;
          cs_contents: string;
          customer_id: string;
          modified_at?: string;
          order_id: string;
          status?: string;
          ticket_id?: string;
          type: string;
        };
        Update: {
          created_at?: string;
          cs_action?: string;
          cs_contents?: string;
          customer_id?: string;
          modified_at?: string;
          order_id?: string;
          status?: string;
          ticket_id?: string;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cs_ticket_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "order";
            referencedColumns: ["order_id"];
          },
        ];
      };
      customer: {
        Row: {
          birthdate: string | null;
          building_name: string | null;
          building_no: string | null;
          created_at: string;
          customer_id: string;
          detail_address: string | null;
          email: string;
          eupmyeondong: string | null;
          gender: string | null;
          grade: string;
          job: string | null;
          location_consent: boolean;
          marketing_optin: boolean;
          modified_at: string | null;
          name: string;
          password_hash: string;
          phone: string;
          privacy_consent: boolean;
          road_name: string | null;
          role: string;
          sido: string | null;
          sigungu: string | null;
          status: string;
          store_id: string | null;
          zipcode: string | null;
        };
        Insert: {
          birthdate?: string | null;
          building_name?: string | null;
          building_no?: string | null;
          created_at?: string;
          customer_id?: string;
          detail_address?: string | null;
          email: string;
          eupmyeondong?: string | null;
          gender?: string | null;
          grade?: string;
          job?: string | null;
          location_consent?: boolean;
          marketing_optin?: boolean;
          modified_at?: string | null;
          name: string;
          password_hash?: string;
          phone?: string;
          privacy_consent?: boolean;
          road_name?: string | null;
          role?: string;
          sido?: string | null;
          sigungu?: string | null;
          status?: string;
          store_id?: string | null;
          zipcode?: string | null;
        };
        Update: {
          birthdate?: string | null;
          building_name?: string | null;
          building_no?: string | null;
          created_at?: string;
          customer_id?: string;
          detail_address?: string | null;
          email?: string;
          eupmyeondong?: string | null;
          gender?: string | null;
          grade?: string;
          job?: string | null;
          location_consent?: boolean;
          marketing_optin?: boolean;
          modified_at?: string | null;
          name?: string;
          password_hash?: string;
          phone?: string;
          privacy_consent?: boolean;
          road_name?: string | null;
          role?: string;
          sido?: string | null;
          sigungu?: string | null;
          status?: string;
          store_id?: string | null;
          zipcode?: string | null;
        };
        Relationships: [];
      };
      customer_shop: {
        Row: {
          created_at: string;
          customer_id: string;
          modified_at: string;
          point_balance: number;
          point_pending: number;
          status: string;
          store_id: string;
          total_earned: number;
          total_expired: number;
          total_used: number;
        };
        Insert: {
          created_at?: string;
          customer_id: string;
          modified_at?: string;
          point_balance?: number;
          point_pending?: number;
          status?: string;
          store_id: string;
          total_earned?: number;
          total_expired?: number;
          total_used?: number;
        };
        Update: {
          created_at?: string;
          customer_id?: string;
          modified_at?: string;
          point_balance?: number;
          point_pending?: number;
          status?: string;
          store_id?: string;
          total_earned?: number;
          total_expired?: number;
          total_used?: number;
        };
        Relationships: [];
      };
      device: {
        Row: {
          app_version: string | null;
          device_id: string;
          platform: string;
          push_token: string | null;
          registered_at: string;
          user_id: string;
        };
        Insert: {
          app_version?: string | null;
          device_id?: string;
          platform: string;
          push_token?: string | null;
          registered_at?: string;
          user_id: string;
        };
        Update: {
          app_version?: string | null;
          device_id?: string;
          platform?: string;
          push_token?: string | null;
          registered_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "device_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
        ];
      };
      dispatch_request: {
        Row: {
          assigned_at: string | null;
          dispatch_id: string;
          order_id: string;
          requested_at: string;
          rider_id: string | null;
          status: string;
          store_id: string;
        };
        Insert: {
          assigned_at?: string | null;
          dispatch_id?: string;
          order_id: string;
          requested_at?: string;
          rider_id?: string | null;
          status?: string;
          store_id: string;
        };
        Update: {
          assigned_at?: string | null;
          dispatch_id?: string;
          order_id?: string;
          requested_at?: string;
          rider_id?: string | null;
          status?: string;
          store_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "dispatch_request_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "order";
            referencedColumns: ["order_id"];
          },
          {
            foreignKeyName: "dispatch_request_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      fp_ad_placement: {
        Row: {
          created_at: string;
          id: string;
          image_url: string | null;
          is_active: boolean;
          position: string;
          tenant_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          position: string;
          tenant_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          position?: string;
          tenant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fp_ad_placement_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenant";
            referencedColumns: ["tenant_id"];
          },
        ];
      };
      geocode_log: {
        Row: {
          created_at: string;
          entity_id: string;
          entity_type: string;
          error_msg: string | null;
          input_address: string;
          log_id: number;
          output_lat: number | null;
          output_lng: number | null;
          provider: string;
          source_app: string;
          status: string;
        };
        Insert: {
          created_at?: string;
          entity_id: string;
          entity_type: string;
          error_msg?: string | null;
          input_address: string;
          log_id?: number;
          output_lat?: number | null;
          output_lng?: number | null;
          provider?: string;
          source_app: string;
          status: string;
        };
        Update: {
          created_at?: string;
          entity_id?: string;
          entity_type?: string;
          error_msg?: string | null;
          input_address?: string;
          log_id?: number;
          output_lat?: number | null;
          output_lng?: number | null;
          provider?: string;
          source_app?: string;
          status?: string;
        };
        Relationships: [];
      };
      incident: {
        Row: {
          assignment_id: string;
          created_at: string;
          description: string | null;
          incident_id: string;
          resolution: Database["public"]["Enums"]["incident_resolution"];
          type: Database["public"]["Enums"]["incident_type"];
          updated_at: string;
        };
        Insert: {
          assignment_id: string;
          created_at?: string;
          description?: string | null;
          incident_id?: string;
          resolution?: Database["public"]["Enums"]["incident_resolution"];
          type: Database["public"]["Enums"]["incident_type"];
          updated_at?: string;
        };
        Update: {
          assignment_id?: string;
          created_at?: string;
          description?: string | null;
          incident_id?: string;
          resolution?: Database["public"]["Enums"]["incident_resolution"];
          type?: Database["public"]["Enums"]["incident_type"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "incident_assignment_id_fkey";
            columns: ["assignment_id"];
            isOneToOne: false;
            referencedRelation: "assignment";
            referencedColumns: ["assignment_id"];
          },
        ];
      };
      inventory: {
        Row: {
          created_at: string;
          inventory_id: string;
          modified_at: string;
          on_hand: number;
          reserved: number;
          safety_stock: number;
          status: string;
          store_id: string;
          store_item_id: string;
        };
        Insert: {
          created_at?: string;
          inventory_id?: string;
          modified_at?: string;
          on_hand?: number;
          reserved?: number;
          safety_stock?: number;
          status?: string;
          store_id: string;
          store_item_id: string;
        };
        Update: {
          created_at?: string;
          inventory_id?: string;
          modified_at?: string;
          on_hand?: number;
          reserved?: number;
          safety_stock?: number;
          status?: string;
          store_id?: string;
          store_item_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inventory_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
          {
            foreignKeyName: "inventory_store_item_id_fkey";
            columns: ["store_item_id"];
            isOneToOne: false;
            referencedRelation: "store_item";
            referencedColumns: ["store_item_id"];
          },
          {
            foreignKeyName: "inventory_store_item_id_fkey";
            columns: ["store_item_id"];
            isOneToOne: false;
            referencedRelation: "v_store_inventory_item";
            referencedColumns: ["store_item_id"];
          },
          {
            foreignKeyName: "inventory_store_item_id_fkey";
            columns: ["store_item_id"];
            isOneToOne: false;
            referencedRelation: "v_store_item";
            referencedColumns: ["store_item_id"];
          },
        ];
      };
      inventory_txn: {
        Row: {
          after_quantity: number;
          before_quantity: number;
          created_at: string;
          inventory_id: string;
          modified_at: string;
          quantity: number;
          reason: string | null;
          ref_id: string;
          ref_type: string;
          status: string;
          store_id: string;
          txnId: string;
          type: string;
        };
        Insert: {
          after_quantity: number;
          before_quantity: number;
          created_at?: string;
          inventory_id: string;
          modified_at?: string;
          quantity: number;
          reason?: string | null;
          ref_id: string;
          ref_type: string;
          status?: string;
          store_id: string;
          txnId?: string;
          type: string;
        };
        Update: {
          after_quantity?: number;
          before_quantity?: number;
          created_at?: string;
          inventory_id?: string;
          modified_at?: string;
          quantity?: number;
          reason?: string | null;
          ref_id?: string;
          ref_type?: string;
          status?: string;
          store_id?: string;
          txnId?: string;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inventory_txn_inventory_id_fkey";
            columns: ["inventory_id"];
            isOneToOne: false;
            referencedRelation: "inventory";
            referencedColumns: ["inventory_id"];
          },
          {
            foreignKeyName: "inventory_txn_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      label: {
        Row: {
          label_id: string;
          label_type: string;
          order_id: string;
          printed_at: string | null;
          zpl_text: string;
        };
        Insert: {
          label_id?: string;
          label_type: string;
          order_id: string;
          printed_at?: string | null;
          zpl_text: string;
        };
        Update: {
          label_id?: string;
          label_type?: string;
          order_id?: string;
          printed_at?: string | null;
          zpl_text?: string;
        };
        Relationships: [
          {
            foreignKeyName: "label_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "order";
            referencedColumns: ["order_id"];
          },
        ];
      };
      memo: {
        Row: {
          ai_context: Json | null;
          created_at: string;
          customer_id: string;
          memo_id: string;
          modified_at: string;
          note: string | null;
          pinned: number;
          status: string;
          title: string | null;
          updated_at: string;
        };
        Insert: {
          ai_context?: Json | null;
          created_at?: string;
          customer_id: string;
          memo_id?: string;
          modified_at?: string;
          note?: string | null;
          pinned?: number;
          status?: string;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          ai_context?: Json | null;
          created_at?: string;
          customer_id?: string;
          memo_id?: string;
          modified_at?: string;
          note?: string | null;
          pinned?: number;
          status?: string;
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      memo_item: {
        Row: {
          created_at: string;
          item: string | null;
          matched_item_id: string | null;
          matched_payload: Json | null;
          matched_score: number | null;
          memo_id: string;
          memo_item_id: string;
          note: string | null;
          qty: string | null;
          qty_unit: string | null;
          qty_value: number | null;
          raw_text: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          item?: string | null;
          matched_item_id?: string | null;
          matched_payload?: Json | null;
          matched_score?: number | null;
          memo_id: string;
          memo_item_id?: string;
          note?: string | null;
          qty?: string | null;
          qty_unit?: string | null;
          qty_value?: number | null;
          raw_text: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          item?: string | null;
          matched_item_id?: string | null;
          matched_payload?: Json | null;
          matched_score?: number | null;
          memo_id?: string;
          memo_item_id?: string;
          note?: string | null;
          qty?: string | null;
          qty_unit?: string | null;
          qty_value?: number | null;
          raw_text?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      memo_recipe: {
        Row: {
          cook_time_min: number | null;
          created_at: string;
          memo_id: string;
          recipe_id: string;
          servings: number | null;
          source: string | null;
          status: string;
          steps_json: Json | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          cook_time_min?: number | null;
          created_at?: string;
          memo_id: string;
          recipe_id?: string;
          servings?: number | null;
          source?: string | null;
          status?: string;
          steps_json?: Json | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          cook_time_min?: number | null;
          created_at?: string;
          memo_id?: string;
          recipe_id?: string;
          servings?: number | null;
          source?: string | null;
          status?: string;
          steps_json?: Json | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      memo_recipe_ingredient: {
        Row: {
          created_at: string;
          ingredient_id: string;
          matched_item_id: string | null;
          matched_score: number | null;
          name_raw: string;
          optional: number;
          qty_text: string | null;
          recipe_id: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          ingredient_id?: string;
          matched_item_id?: string | null;
          matched_score?: number | null;
          name_raw: string;
          optional?: number;
          qty_text?: string | null;
          recipe_id: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          ingredient_id?: string;
          matched_item_id?: string | null;
          matched_score?: number | null;
          name_raw?: string;
          optional?: number;
          qty_text?: string | null;
          recipe_id?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      message: {
        Row: {
          content: string;
          content_type: string;
          created_at: string;
          is_read: boolean;
          msg_id: string;
          sender_id: string;
          sender_type: string;
          thread_id: string;
        };
        Insert: {
          content: string;
          content_type?: string;
          created_at?: string;
          is_read?: boolean;
          msg_id?: string;
          sender_id: string;
          sender_type: string;
          thread_id: string;
        };
        Update: {
          content?: string;
          content_type?: string;
          created_at?: string;
          is_read?: boolean;
          msg_id?: string;
          sender_id?: string;
          sender_type?: string;
          thread_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "message_thread_id_fkey";
            columns: ["thread_id"];
            isOneToOne: false;
            referencedRelation: "message_thread";
            referencedColumns: ["thread_id"];
          },
        ];
      };
      message_thread: {
        Row: {
          created_at: string;
          customer_id: string | null;
          last_message_at: string | null;
          order_id: string;
          rider_id: string | null;
          seller_id: string | null;
          shipment_id: string | null;
          status: string;
          thread_id: string;
        };
        Insert: {
          created_at?: string;
          customer_id?: string | null;
          last_message_at?: string | null;
          order_id: string;
          rider_id?: string | null;
          seller_id?: string | null;
          shipment_id?: string | null;
          status?: string;
          thread_id?: string;
        };
        Update: {
          created_at?: string;
          customer_id?: string | null;
          last_message_at?: string | null;
          order_id?: string;
          rider_id?: string | null;
          seller_id?: string | null;
          shipment_id?: string | null;
          status?: string;
          thread_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "message_thread_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "message_thread_rider_id_fkey";
            columns: ["rider_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "message_thread_seller_id_fkey";
            columns: ["seller_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
        ];
      };
      notification: {
        Row: {
          body: string;
          channel: string;
          created_at: string;
          noti_id: string;
          sent_at: string | null;
          status: string;
          title: string;
          user_id: string;
        };
        Insert: {
          body: string;
          channel: string;
          created_at?: string;
          noti_id?: string;
          sent_at?: string | null;
          status?: string;
          title: string;
          user_id: string;
        };
        Update: {
          body?: string;
          channel?: string;
          created_at?: string;
          noti_id?: string;
          sent_at?: string | null;
          status?: string;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notification_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
        ];
      };
      oauth_token: {
        Row: {
          access_token: string;
          created_at: string;
          expires_at: string | null;
          provider: string;
          refresh_token: string | null;
          token_id: string;
          user_id: string;
        };
        Insert: {
          access_token: string;
          created_at?: string;
          expires_at?: string | null;
          provider: string;
          refresh_token?: string | null;
          token_id?: string;
          user_id: string;
        };
        Update: {
          access_token?: string;
          created_at?: string;
          expires_at?: string | null;
          provider?: string;
          refresh_token?: string | null;
          token_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "oauth_token_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
        ];
      };
      order: {
        Row: {
          address_id: string | null;
          created_at: string;
          customer_id: string;
          delivery_fee: number;
          delivery_method: string | null;
          delivery_price: number;
          discounted_total_price: number;
          final_payable: number;
          modified_at: string;
          order_id: string;
          order_no: string;
          order_price: number;
          ordered_at: string;
          origin_total_price: number;
          paid_at: string | null;
          payment_id: string | null;
          points_earned: number;
          points_redeemed: number;
          points_value_redeemed: number;
          quick_depart_date: string | null;
          quick_depart_time: string | null;
          refund_status: string | null;
          reject_reason: string | null;
          rejected_at: string | null;
          requests: string | null;
          ro_rider_id: string | null;
          status: string;
          store_id: string;
        };
        Insert: {
          address_id?: string | null;
          created_at?: string;
          customer_id: string;
          delivery_fee?: number;
          delivery_method?: string | null;
          delivery_price: number;
          discounted_total_price: number;
          final_payable: number;
          modified_at?: string;
          order_id?: string;
          order_no: string;
          order_price: number;
          ordered_at?: string;
          origin_total_price: number;
          paid_at?: string | null;
          payment_id?: string | null;
          points_earned?: number;
          points_redeemed?: number;
          points_value_redeemed?: number;
          quick_depart_date?: string | null;
          quick_depart_time?: string | null;
          refund_status?: string | null;
          reject_reason?: string | null;
          rejected_at?: string | null;
          requests?: string | null;
          ro_rider_id?: string | null;
          status?: string;
          store_id: string;
        };
        Update: {
          address_id?: string | null;
          created_at?: string;
          customer_id?: string;
          delivery_fee?: number;
          delivery_method?: string | null;
          delivery_price?: number;
          discounted_total_price?: number;
          final_payable?: number;
          modified_at?: string;
          order_id?: string;
          order_no?: string;
          order_price?: number;
          ordered_at?: string;
          origin_total_price?: number;
          paid_at?: string | null;
          payment_id?: string | null;
          points_earned?: number;
          points_redeemed?: number;
          points_value_redeemed?: number;
          quick_depart_date?: string | null;
          quick_depart_time?: string | null;
          refund_status?: string | null;
          reject_reason?: string | null;
          rejected_at?: string | null;
          requests?: string | null;
          ro_rider_id?: string | null;
          status?: string;
          store_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      order_item: {
        Row: {
          created_at: string;
          discount: number | null;
          line_total: number;
          order_detail_id: string;
          order_id: string;
          qty: number;
          shipped_qty: number | null;
          status: string;
          store_item_id: string;
          unit_price: number;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          discount?: number | null;
          line_total: number;
          order_detail_id?: string;
          order_id: string;
          qty: number;
          shipped_qty?: number | null;
          status?: string;
          store_item_id: string;
          unit_price: number;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          discount?: number | null;
          line_total?: number;
          order_detail_id?: string;
          order_id?: string;
          qty?: number;
          shipped_qty?: number | null;
          status?: string;
          store_item_id?: string;
          unit_price?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "order_item_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "order";
            referencedColumns: ["order_id"];
          },
          {
            foreignKeyName: "order_item_store_item_id_fkey";
            columns: ["store_item_id"];
            isOneToOne: false;
            referencedRelation: "store_item";
            referencedColumns: ["store_item_id"];
          },
          {
            foreignKeyName: "order_item_store_item_id_fkey";
            columns: ["store_item_id"];
            isOneToOne: false;
            referencedRelation: "v_store_inventory_item";
            referencedColumns: ["store_item_id"];
          },
          {
            foreignKeyName: "order_item_store_item_id_fkey";
            columns: ["store_item_id"];
            isOneToOne: false;
            referencedRelation: "v_store_item";
            referencedColumns: ["store_item_id"];
          },
        ];
      };
      otp_request: {
        Row: {
          attempts: number;
          code: string;
          created_at: string;
          expires_at: string;
          id: string;
          phone: string;
          verified: boolean;
        };
        Insert: {
          attempts?: number;
          code: string;
          created_at?: string;
          expires_at: string;
          id?: string;
          phone: string;
          verified?: boolean;
        };
        Update: {
          attempts?: number;
          code?: string;
          created_at?: string;
          expires_at?: string;
          id?: string;
          phone?: string;
          verified?: boolean;
        };
        Relationships: [];
      };
      packing_task: {
        Row: {
          completed_at: string | null;
          order_id: string;
          pack_id: string;
          packer_id: string | null;
          packing_weight: number | null;
          status: string;
        };
        Insert: {
          completed_at?: string | null;
          order_id: string;
          pack_id?: string;
          packer_id?: string | null;
          packing_weight?: number | null;
          status?: string;
        };
        Update: {
          completed_at?: string | null;
          order_id?: string;
          pack_id?: string;
          packer_id?: string | null;
          packing_weight?: number | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "packing_task_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "order";
            referencedColumns: ["order_id"];
          },
          {
            foreignKeyName: "packing_task_packer_id_fkey";
            columns: ["packer_id"];
            isOneToOne: false;
            referencedRelation: "seller";
            referencedColumns: ["seller_id"];
          },
        ];
      };
      payment: {
        Row: {
          approved_at: string | null;
          created_at: string;
          delivery_fee: number;
          delivery_method: string | null;
          net_paid_amount: number;
          order_id: string;
          paid_amount: number;
          payment_id: string;
          payment_method: string;
          pg_tx_id: string | null;
          points_used: number;
          status: string;
        };
        Insert: {
          approved_at?: string | null;
          created_at?: string;
          delivery_fee?: number;
          delivery_method?: string | null;
          net_paid_amount?: number;
          order_id: string;
          paid_amount?: number;
          payment_id?: string;
          payment_method?: string;
          pg_tx_id?: string | null;
          points_used?: number;
          status?: string;
        };
        Update: {
          approved_at?: string | null;
          created_at?: string;
          delivery_fee?: number;
          delivery_method?: string | null;
          net_paid_amount?: number;
          order_id?: string;
          paid_amount?: number;
          payment_id?: string;
          payment_method?: string;
          pg_tx_id?: string | null;
          points_used?: number;
          status?: string;
        };
        Relationships: [];
      };
      payment_error_log: {
        Row: {
          created_at: string | null;
          customer_id: string | null;
          error_message: string | null;
          error_type: string | null;
          id: number;
          order_no: string | null;
          payment_amount: number | null;
          payment_key: string | null;
          refund_attempted_at: string | null;
          refund_status: string | null;
          resolved_at: string | null;
          resolved_by: string | null;
        };
        Insert: {
          created_at?: string | null;
          customer_id?: string | null;
          error_message?: string | null;
          error_type?: string | null;
          id?: number;
          order_no?: string | null;
          payment_amount?: number | null;
          payment_key?: string | null;
          refund_attempted_at?: string | null;
          refund_status?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
        };
        Update: {
          created_at?: string | null;
          customer_id?: string | null;
          error_message?: string | null;
          error_type?: string | null;
          id?: number;
          order_no?: string | null;
          payment_amount?: number | null;
          payment_key?: string | null;
          refund_attempted_at?: string | null;
          refund_status?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
        };
        Relationships: [];
      };
      picking_item: {
        Row: {
          memo: string | null;
          order_item_id: string;
          picked_qty: number;
          picking_item_id: string;
          requested_qty: number;
          result: string;
          substitute_product_id: string | null;
          task_id: string;
        };
        Insert: {
          memo?: string | null;
          order_item_id: string;
          picked_qty?: number;
          picking_item_id?: string;
          requested_qty: number;
          result?: string;
          substitute_product_id?: string | null;
          task_id: string;
        };
        Update: {
          memo?: string | null;
          order_item_id?: string;
          picked_qty?: number;
          picking_item_id?: string;
          requested_qty?: number;
          result?: string;
          substitute_product_id?: string | null;
          task_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "picking_item_order_item_id_fkey";
            columns: ["order_item_id"];
            isOneToOne: false;
            referencedRelation: "order_item";
            referencedColumns: ["order_detail_id"];
          },
          {
            foreignKeyName: "picking_item_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "picking_task";
            referencedColumns: ["task_id"];
          },
        ];
      };
      picking_task: {
        Row: {
          completed_at: string | null;
          created_at: string;
          order_id: string;
          picker_id: string | null;
          status: string;
          store_id: string;
          task_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          order_id: string;
          picker_id?: string | null;
          status?: string;
          store_id: string;
          task_id?: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          order_id?: string;
          picker_id?: string | null;
          status?: string;
          store_id?: string;
          task_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "picking_task_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "order";
            referencedColumns: ["order_id"];
          },
          {
            foreignKeyName: "picking_task_picker_id_fkey";
            columns: ["picker_id"];
            isOneToOne: false;
            referencedRelation: "seller";
            referencedColumns: ["seller_id"];
          },
          {
            foreignKeyName: "picking_task_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      point_history: {
        Row: {
          amount: number;
          balance: number;
          balance_after: number | null;
          created_at: string;
          customer_id: string;
          description: string | null;
          expires_at: string | null;
          order_id: string | null;
          point_id: string;
          store_id: string | null;
          type: string;
        };
        Insert: {
          amount: number;
          balance: number;
          balance_after?: number | null;
          created_at?: string;
          customer_id: string;
          description?: string | null;
          expires_at?: string | null;
          order_id?: string | null;
          point_id?: string;
          store_id?: string | null;
          type: string;
        };
        Update: {
          amount?: number;
          balance?: number;
          balance_after?: number | null;
          created_at?: string;
          customer_id?: string;
          description?: string | null;
          expires_at?: string | null;
          order_id?: string | null;
          point_id?: string;
          store_id?: string | null;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "point_history_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      promotion: {
        Row: {
          bundle_price: number | null;
          created_at: string;
          discount_unit: string | null;
          discount_value: number | null;
          end_at: string;
          flash_dow_mask: string | null;
          flash_enabled: number;
          flash_time_end: string | null;
          flash_time_start: string | null;
          max_usage: number | null;
          name: string;
          per_user_limit: number | null;
          priority: number;
          promo_id: string;
          stackable: number;
          start_at: string;
          status: string;
          store_id: string;
          type: string;
          updated_at: string;
        };
        Insert: {
          bundle_price?: number | null;
          created_at?: string;
          discount_unit?: string | null;
          discount_value?: number | null;
          end_at: string;
          flash_dow_mask?: string | null;
          flash_enabled?: number;
          flash_time_end?: string | null;
          flash_time_start?: string | null;
          max_usage?: number | null;
          name: string;
          per_user_limit?: number | null;
          priority?: number;
          promo_id?: string;
          stackable?: number;
          start_at: string;
          status?: string;
          store_id: string;
          type: string;
          updated_at?: string;
        };
        Update: {
          bundle_price?: number | null;
          created_at?: string;
          discount_unit?: string | null;
          discount_value?: number | null;
          end_at?: string;
          flash_dow_mask?: string | null;
          flash_enabled?: number;
          flash_time_end?: string | null;
          flash_time_start?: string | null;
          max_usage?: number | null;
          name?: string;
          per_user_limit?: number | null;
          priority?: number;
          promo_id?: string;
          stackable?: number;
          start_at?: string;
          status?: string;
          store_id?: string;
          type?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "promotion_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      promotion_item: {
        Row: {
          condition_qty: number | null;
          created_at: string;
          id: string;
          limit_per_order: number | null;
          promo_id: string;
          reward_qty: number | null;
          reward_store_item_id: string | null;
          status: string;
          store_item_id: string;
          updated_at: string;
        };
        Insert: {
          condition_qty?: number | null;
          created_at?: string;
          id?: string;
          limit_per_order?: number | null;
          promo_id: string;
          reward_qty?: number | null;
          reward_store_item_id?: string | null;
          status?: string;
          store_item_id: string;
          updated_at?: string;
        };
        Update: {
          condition_qty?: number | null;
          created_at?: string;
          id?: string;
          limit_per_order?: number | null;
          promo_id?: string;
          reward_qty?: number | null;
          reward_store_item_id?: string | null;
          status?: string;
          store_item_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "promotion_item_promo_id_fkey";
            columns: ["promo_id"];
            isOneToOne: false;
            referencedRelation: "promotion";
            referencedColumns: ["promo_id"];
          },
          {
            foreignKeyName: "promotion_item_reward_store_item_id_fkey";
            columns: ["reward_store_item_id"];
            isOneToOne: false;
            referencedRelation: "store_item";
            referencedColumns: ["store_item_id"];
          },
          {
            foreignKeyName: "promotion_item_reward_store_item_id_fkey";
            columns: ["reward_store_item_id"];
            isOneToOne: false;
            referencedRelation: "v_store_inventory_item";
            referencedColumns: ["store_item_id"];
          },
          {
            foreignKeyName: "promotion_item_reward_store_item_id_fkey";
            columns: ["reward_store_item_id"];
            isOneToOne: false;
            referencedRelation: "v_store_item";
            referencedColumns: ["store_item_id"];
          },
          {
            foreignKeyName: "promotion_item_store_item_id_fkey";
            columns: ["store_item_id"];
            isOneToOne: false;
            referencedRelation: "store_item";
            referencedColumns: ["store_item_id"];
          },
          {
            foreignKeyName: "promotion_item_store_item_id_fkey";
            columns: ["store_item_id"];
            isOneToOne: false;
            referencedRelation: "v_store_inventory_item";
            referencedColumns: ["store_item_id"];
          },
          {
            foreignKeyName: "promotion_item_store_item_id_fkey";
            columns: ["store_item_id"];
            isOneToOne: false;
            referencedRelation: "v_store_item";
            referencedColumns: ["store_item_id"];
          },
        ];
      };
      proof: {
        Row: {
          assignment_id: string;
          created_at: string;
          otp_verified: boolean;
          proof_id: string;
          signer_name: string | null;
          storage_url: string | null;
          type: Database["public"]["Enums"]["proof_type"];
        };
        Insert: {
          assignment_id: string;
          created_at?: string;
          otp_verified?: boolean;
          proof_id?: string;
          signer_name?: string | null;
          storage_url?: string | null;
          type: Database["public"]["Enums"]["proof_type"];
        };
        Update: {
          assignment_id?: string;
          created_at?: string;
          otp_verified?: boolean;
          proof_id?: string;
          signer_name?: string | null;
          storage_url?: string | null;
          type?: Database["public"]["Enums"]["proof_type"];
        };
        Relationships: [
          {
            foreignKeyName: "proof_assignment_id_fkey";
            columns: ["assignment_id"];
            isOneToOne: false;
            referencedRelation: "assignment";
            referencedColumns: ["assignment_id"];
          },
        ];
      };
      review: {
        Row: {
          content: string | null;
          created_at: string;
          customer_id: string;
          modified_at: string;
          order_id: string | null;
          rating: number;
          review_id: string;
          review_picture_url: string | null;
          status: string;
          store_id: string;
          store_item_id: string | null;
        };
        Insert: {
          content?: string | null;
          created_at?: string;
          customer_id: string;
          modified_at?: string;
          order_id?: string | null;
          rating: number;
          review_id?: string;
          review_picture_url?: string | null;
          status?: string;
          store_id: string;
          store_item_id?: string | null;
        };
        Update: {
          content?: string | null;
          created_at?: string;
          customer_id?: string;
          modified_at?: string;
          order_id?: string | null;
          rating?: number;
          review_id?: string;
          review_picture_url?: string | null;
          status?: string;
          store_id?: string;
          store_item_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "review_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
          {
            foreignKeyName: "review_store_item_id_fkey";
            columns: ["store_item_id"];
            isOneToOne: false;
            referencedRelation: "store_item";
            referencedColumns: ["store_item_id"];
          },
          {
            foreignKeyName: "review_store_item_id_fkey";
            columns: ["store_item_id"];
            isOneToOne: false;
            referencedRelation: "v_store_inventory_item";
            referencedColumns: ["store_item_id"];
          },
          {
            foreignKeyName: "review_store_item_id_fkey";
            columns: ["store_item_id"];
            isOneToOne: false;
            referencedRelation: "v_store_item";
            referencedColumns: ["store_item_id"];
          },
        ];
      };
      rider: {
        Row: {
          account_no: string | null;
          bank_name: string | null;
          base_fee: number;
          created_at: string;
          email: string;
          fee_per_km: number;
          gender: string | null;
          geocoded_at: string | null;
          home_lat: number | null;
          home_lng: number | null;
          last_lat: number | null;
          last_lng: number | null;
          last_seen_at: string | null;
          location_consent: boolean;
          marketing_optin: boolean;
          min_fee: number;
          name: string;
          phone: string;
          privacy_consent: boolean;
          rider_id: string;
          service_consent: boolean;
          status: Database["public"]["Enums"]["rider_status"];
          updated_at: string;
          user_id: string;
          vehicle_type: Database["public"]["Enums"]["vehicle_type"];
        };
        Insert: {
          account_no?: string | null;
          bank_name?: string | null;
          base_fee?: number;
          created_at?: string;
          email: string;
          fee_per_km?: number;
          gender?: string | null;
          geocoded_at?: string | null;
          home_lat?: number | null;
          home_lng?: number | null;
          last_lat?: number | null;
          last_lng?: number | null;
          last_seen_at?: string | null;
          location_consent?: boolean;
          marketing_optin?: boolean;
          min_fee?: number;
          name: string;
          phone: string;
          privacy_consent?: boolean;
          rider_id?: string;
          service_consent?: boolean;
          status?: Database["public"]["Enums"]["rider_status"];
          updated_at?: string;
          user_id: string;
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"];
        };
        Update: {
          account_no?: string | null;
          bank_name?: string | null;
          base_fee?: number;
          created_at?: string;
          email?: string;
          fee_per_km?: number;
          gender?: string | null;
          geocoded_at?: string | null;
          home_lat?: number | null;
          home_lng?: number | null;
          last_lat?: number | null;
          last_lng?: number | null;
          last_seen_at?: string | null;
          location_consent?: boolean;
          marketing_optin?: boolean;
          min_fee?: number;
          name?: string;
          phone?: string;
          privacy_consent?: boolean;
          rider_id?: string;
          service_consent?: boolean;
          status?: Database["public"]["Enums"]["rider_status"];
          updated_at?: string;
          user_id?: string;
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"];
        };
        Relationships: [];
      };
      rider_payment_log: {
        Row: {
          assignment_id: string;
          created_at: string;
          fee_amount: number;
          log_id: string;
          paid_at: string | null;
          rider_id: string;
          status: Database["public"]["Enums"]["payment_log_status"];
        };
        Insert: {
          assignment_id: string;
          created_at?: string;
          fee_amount: number;
          log_id?: string;
          paid_at?: string | null;
          rider_id: string;
          status?: Database["public"]["Enums"]["payment_log_status"];
        };
        Update: {
          assignment_id?: string;
          created_at?: string;
          fee_amount?: number;
          log_id?: string;
          paid_at?: string | null;
          rider_id?: string;
          status?: Database["public"]["Enums"]["payment_log_status"];
        };
        Relationships: [
          {
            foreignKeyName: "rider_payment_log_assignment_id_fkey";
            columns: ["assignment_id"];
            isOneToOne: true;
            referencedRelation: "assignment";
            referencedColumns: ["assignment_id"];
          },
          {
            foreignKeyName: "rider_payment_log_rider_id_fkey";
            columns: ["rider_id"];
            isOneToOne: false;
            referencedRelation: "rider";
            referencedColumns: ["rider_id"];
          },
        ];
      };
      rider_setting: {
        Row: {
          assign_alert: boolean;
          auto_login: boolean;
          dark_mode: boolean;
          font_size: string;
          font_weight: string;
          location_based_order: boolean;
          map_provider: string;
          navigation_app: string;
          new_order_alert: boolean;
          payment_wifi_only: boolean;
          post_pickup_screen: boolean;
          rider_id: string;
          save_id: boolean;
          sound_channel: string;
          updated_at: string;
        };
        Insert: {
          assign_alert?: boolean;
          auto_login?: boolean;
          dark_mode?: boolean;
          font_size?: string;
          font_weight?: string;
          location_based_order?: boolean;
          map_provider?: string;
          navigation_app?: string;
          new_order_alert?: boolean;
          payment_wifi_only?: boolean;
          post_pickup_screen?: boolean;
          rider_id: string;
          save_id?: boolean;
          sound_channel?: string;
          updated_at?: string;
        };
        Update: {
          assign_alert?: boolean;
          auto_login?: boolean;
          dark_mode?: boolean;
          font_size?: string;
          font_weight?: string;
          location_based_order?: boolean;
          map_provider?: string;
          navigation_app?: string;
          new_order_alert?: boolean;
          payment_wifi_only?: boolean;
          post_pickup_screen?: boolean;
          rider_id?: string;
          save_id?: boolean;
          sound_channel?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rider_setting_rider_id_fkey";
            columns: ["rider_id"];
            isOneToOne: true;
            referencedRelation: "rider";
            referencedColumns: ["rider_id"];
          },
        ];
      };
      rider_shift: {
        Row: {
          created_at: string;
          ended_at: string | null;
          rider_id: string;
          shift_id: string;
          started_at: string;
          status: string;
          total_earning: number;
        };
        Insert: {
          created_at?: string;
          ended_at?: string | null;
          rider_id: string;
          shift_id?: string;
          started_at?: string;
          status?: string;
          total_earning?: number;
        };
        Update: {
          created_at?: string;
          ended_at?: string | null;
          rider_id?: string;
          shift_id?: string;
          started_at?: string;
          status?: string;
          total_earning?: number;
        };
        Relationships: [
          {
            foreignKeyName: "rider_shift_rider_id_fkey";
            columns: ["rider_id"];
            isOneToOne: false;
            referencedRelation: "rider";
            referencedColumns: ["rider_id"];
          },
        ];
      };
      rider_store_application: {
        Row: {
          application_id: string;
          applied_distance_m: number | null;
          applied_lat: number;
          applied_lng: number;
          created_at: string;
          message: string | null;
          review_note: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          rider_id: string;
          status: string;
          store_id: string;
          updated_at: string;
        };
        Insert: {
          application_id?: string;
          applied_distance_m?: number | null;
          applied_lat: number;
          applied_lng: number;
          created_at?: string;
          message?: string | null;
          review_note?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          rider_id: string;
          status?: string;
          store_id: string;
          updated_at?: string;
        };
        Update: {
          application_id?: string;
          applied_distance_m?: number | null;
          applied_lat?: number;
          applied_lng?: number;
          created_at?: string;
          message?: string | null;
          review_note?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          rider_id?: string;
          status?: string;
          store_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rider_store_application_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "seller";
            referencedColumns: ["seller_id"];
          },
          {
            foreignKeyName: "rider_store_application_rider_id_fkey";
            columns: ["rider_id"];
            isOneToOne: false;
            referencedRelation: "rider";
            referencedColumns: ["rider_id"];
          },
          {
            foreignKeyName: "rider_store_application_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      rider_store_assignment: {
        Row: {
          application_id: string | null;
          approved_at: string;
          approved_by: string | null;
          assignment_id: string;
          rider_id: string;
          status: string;
          store_id: string;
          terminated_at: string | null;
          termination_reason: string | null;
        };
        Insert: {
          application_id?: string | null;
          approved_at?: string;
          approved_by?: string | null;
          assignment_id?: string;
          rider_id: string;
          status?: string;
          store_id: string;
          terminated_at?: string | null;
          termination_reason?: string | null;
        };
        Update: {
          application_id?: string | null;
          approved_at?: string;
          approved_by?: string | null;
          assignment_id?: string;
          rider_id?: string;
          status?: string;
          store_id?: string;
          terminated_at?: string | null;
          termination_reason?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "rider_store_assignment_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "rider_store_application";
            referencedColumns: ["application_id"];
          },
          {
            foreignKeyName: "rider_store_assignment_approved_by_fkey";
            columns: ["approved_by"];
            isOneToOne: false;
            referencedRelation: "seller";
            referencedColumns: ["seller_id"];
          },
          {
            foreignKeyName: "rider_store_assignment_rider_id_fkey";
            columns: ["rider_id"];
            isOneToOne: false;
            referencedRelation: "rider";
            referencedColumns: ["rider_id"];
          },
          {
            foreignKeyName: "rider_store_assignment_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      route_point: {
        Row: {
          assignment_id: string;
          lat: number;
          lng: number;
          point_id: string;
          recorded_at: string;
          type: Database["public"]["Enums"]["route_point_type"];
        };
        Insert: {
          assignment_id: string;
          lat: number;
          lng: number;
          point_id?: string;
          recorded_at?: string;
          type: Database["public"]["Enums"]["route_point_type"];
        };
        Update: {
          assignment_id?: string;
          lat?: number;
          lng?: number;
          point_id?: string;
          recorded_at?: string;
          type?: Database["public"]["Enums"]["route_point_type"];
        };
        Relationships: [
          {
            foreignKeyName: "route_point_assignment_id_fkey";
            columns: ["assignment_id"];
            isOneToOne: false;
            referencedRelation: "assignment";
            referencedColumns: ["assignment_id"];
          },
        ];
      };
      seller: {
        Row: {
          auth_user_id: string | null;
          created_at: string;
          email: string;
          is_active: string;
          name: string;
          password_changed: boolean;
          phone: string | null;
          role: string;
          seller_id: string;
          store_id: string;
        };
        Insert: {
          auth_user_id?: string | null;
          created_at?: string;
          email: string;
          is_active?: string;
          name: string;
          password_changed?: boolean;
          phone?: string | null;
          role: string;
          seller_id?: string;
          store_id: string;
        };
        Update: {
          auth_user_id?: string | null;
          created_at?: string;
          email?: string;
          is_active?: string;
          name?: string;
          password_changed?: boolean;
          phone?: string | null;
          role?: string;
          seller_id?: string;
          store_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "seller_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      shipment: {
        Row: {
          delivery_fee: number;
          depart_date: string | null;
          depart_time: string | null;
          eta_max: number | null;
          eta_min: number | null;
          method: string;
          order_id: string;
          quote_id: string | null;
          rider_id: string | null;
          shipment_id: string;
          status: string;
          store_id: string | null;
          tracking_no: string | null;
          updated_at: string;
        };
        Insert: {
          delivery_fee?: number;
          depart_date?: string | null;
          depart_time?: string | null;
          eta_max?: number | null;
          eta_min?: number | null;
          method: string;
          order_id: string;
          quote_id?: string | null;
          rider_id?: string | null;
          shipment_id?: string;
          status?: string;
          store_id?: string | null;
          tracking_no?: string | null;
          updated_at?: string;
        };
        Update: {
          delivery_fee?: number;
          depart_date?: string | null;
          depart_time?: string | null;
          eta_max?: number | null;
          eta_min?: number | null;
          method?: string;
          order_id?: string;
          quote_id?: string | null;
          rider_id?: string | null;
          shipment_id?: string;
          status?: string;
          store_id?: string | null;
          tracking_no?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shipment_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "order";
            referencedColumns: ["order_id"];
          },
          {
            foreignKeyName: "shipment_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      shipment_event: {
        Row: {
          created_at: string;
          event_code: string;
          event_id: string;
          memo: string | null;
          metadata: Json | null;
          shipment_id: string;
        };
        Insert: {
          created_at?: string;
          event_code: string;
          event_id?: string;
          memo?: string | null;
          metadata?: Json | null;
          shipment_id: string;
        };
        Update: {
          created_at?: string;
          event_code?: string;
          event_id?: string;
          memo?: string | null;
          metadata?: Json | null;
          shipment_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shipment_event_shipment_id_fkey";
            columns: ["shipment_id"];
            isOneToOne: false;
            referencedRelation: "shipment";
            referencedColumns: ["shipment_id"];
          },
        ];
      };
      standard_large_code_archive: {
        Row: {
          code: string;
          created_at: string;
          large_code_id: string;
          name: string;
          status: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          large_code_id?: string;
          name: string;
          status?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          large_code_id?: string;
          name?: string;
          status?: string;
        };
        Relationships: [];
      };
      standard_medium_code_archive: {
        Row: {
          code: string;
          created_at: string;
          large_code_id: string;
          medium_code_id: string;
          name: string;
          status: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          large_code_id: string;
          medium_code_id?: string;
          name: string;
          status?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          large_code_id?: string;
          medium_code_id?: string;
          name?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "standard_medium_code_large_code_id_fkey";
            columns: ["large_code_id"];
            isOneToOne: false;
            referencedRelation: "standard_large_code_archive";
            referencedColumns: ["large_code_id"];
          },
        ];
      };
      standard_small_code_archive: {
        Row: {
          code: string;
          created_at: string;
          medium_code_id: string;
          name: string;
          small_code_id: string;
          status: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          medium_code_id: string;
          name: string;
          small_code_id?: string;
          status?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          medium_code_id?: string;
          name?: string;
          small_code_id?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "standard_small_code_medium_code_id_fkey";
            columns: ["medium_code_id"];
            isOneToOne: false;
            referencedRelation: "standard_medium_code_archive";
            referencedColumns: ["medium_code_id"];
          },
        ];
      };
      store: {
        Row: {
          accrual_rate_pct: number | null;
          addr_detail: string | null;
          address: string;
          ceo_name: string;
          closed_days: string | null;
          contnet: string | null;
          contract_date: string | null;
          contract_end_at: string;
          contract_start_at: string;
          created_at: string;
          delivery_address: string | null;
          delivery_radius_m: number;
          delivery_tip: number;
          dibs_count: number;
          expire_after_days: number | null;
          fee: number;
          geocoded_at: string | null;
          jumin_number: string;
          lat: number | null;
          lng: number | null;
          max_delivery_time: number | null;
          max_redeem_amount: number | null;
          max_redeem_rate_pct: number | null;
          min_delivery_price: number;
          min_delivery_time: number | null;
          min_redeem_unit: number | null;
          modified_at: string;
          name: string;
          operation_hours: string | null;
          phone: string;
          points_enabled: number;
          rating: number;
          redeem_enabled: number;
          reg_code: string;
          reg_number: string;
          review_count: number;
          rounding_mode: string | null;
          status: string;
          store_category: string;
          store_id: string;
          store_picture: string | null;
          tenant_id: string;
        };
        Insert: {
          accrual_rate_pct?: number | null;
          addr_detail?: string | null;
          address: string;
          ceo_name?: string;
          closed_days?: string | null;
          contnet?: string | null;
          contract_date?: string | null;
          contract_end_at: string;
          contract_start_at: string;
          created_at?: string;
          delivery_address?: string | null;
          delivery_radius_m?: number;
          delivery_tip?: number;
          dibs_count?: number;
          expire_after_days?: number | null;
          fee: number;
          geocoded_at?: string | null;
          jumin_number?: string;
          lat?: number | null;
          lng?: number | null;
          max_delivery_time?: number | null;
          max_redeem_amount?: number | null;
          max_redeem_rate_pct?: number | null;
          min_delivery_price?: number;
          min_delivery_time?: number | null;
          min_redeem_unit?: number | null;
          modified_at?: string;
          name: string;
          operation_hours?: string | null;
          phone?: string;
          points_enabled?: number;
          rating?: number;
          redeem_enabled?: number;
          reg_code?: string;
          reg_number?: string;
          review_count?: number;
          rounding_mode?: string | null;
          status?: string;
          store_category: string;
          store_id?: string;
          store_picture?: string | null;
          tenant_id: string;
        };
        Update: {
          accrual_rate_pct?: number | null;
          addr_detail?: string | null;
          address?: string;
          ceo_name?: string;
          closed_days?: string | null;
          contnet?: string | null;
          contract_date?: string | null;
          contract_end_at?: string;
          contract_start_at?: string;
          created_at?: string;
          delivery_address?: string | null;
          delivery_radius_m?: number;
          delivery_tip?: number;
          dibs_count?: number;
          expire_after_days?: number | null;
          fee?: number;
          geocoded_at?: string | null;
          jumin_number?: string;
          lat?: number | null;
          lng?: number | null;
          max_delivery_time?: number | null;
          max_redeem_amount?: number | null;
          max_redeem_rate_pct?: number | null;
          min_delivery_price?: number;
          min_delivery_time?: number | null;
          min_redeem_unit?: number | null;
          modified_at?: string;
          name?: string;
          operation_hours?: string | null;
          phone?: string;
          points_enabled?: number;
          rating?: number;
          redeem_enabled?: number;
          reg_code?: string;
          reg_number?: string;
          review_count?: number;
          rounding_mode?: string | null;
          status?: string;
          store_category?: string;
          store_id?: string;
          store_picture?: string | null;
          tenant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "store_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenant";
            referencedColumns: ["tenant_id"];
          },
        ];
      };
      store_fulfillment: {
        Row: {
          active: boolean;
          created_at: string;
          fulfillment_type: string;
          id: string;
          store_id: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          fulfillment_type: string;
          id?: string;
          store_id: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          fulfillment_type?: string;
          id?: string;
          store_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "store_fulfillment_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      store_item: {
        Row: {
          created_at: string;
          item_name: string | null;
          list_price: number | null;
          ranking: number | null;
          ranking_yn: string | null;
          sale_price: number | null;
          status: string | null;
          store_id: string;
          store_item_id: string;
          tenant_item_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          item_name?: string | null;
          list_price?: number | null;
          ranking?: number | null;
          ranking_yn?: string | null;
          sale_price?: number | null;
          status?: string | null;
          store_id: string;
          store_item_id?: string;
          tenant_item_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          item_name?: string | null;
          list_price?: number | null;
          ranking?: number | null;
          ranking_yn?: string | null;
          sale_price?: number | null;
          status?: string | null;
          store_id?: string;
          store_item_id?: string;
          tenant_item_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "store_item_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
          {
            foreignKeyName: "store_item_tenant_item_id_fkey";
            columns: ["tenant_item_id"];
            isOneToOne: false;
            referencedRelation: "tenant_item_master";
            referencedColumns: ["tenant_item_id"];
          },
          {
            foreignKeyName: "store_item_tenant_item_id_fkey";
            columns: ["tenant_item_id"];
            isOneToOne: false;
            referencedRelation: "v_store_inventory_item";
            referencedColumns: ["tenant_item_id"];
          },
          {
            foreignKeyName: "store_item_tenant_item_id_fkey";
            columns: ["tenant_item_id"];
            isOneToOne: false;
            referencedRelation: "v_store_item";
            referencedColumns: ["tenant_item_id"];
          },
        ];
      };
      store_quick_policy: {
        Row: {
          capacity_per_slot: number;
          created_at: string;
          daily_runs: number;
          min_order_amount: number;
          policy_id: string;
          status: string;
          store_id: string;
          updated_at: string;
        };
        Insert: {
          capacity_per_slot?: number;
          created_at?: string;
          daily_runs?: number;
          min_order_amount?: number;
          policy_id?: string;
          status?: string;
          store_id: string;
          updated_at?: string;
        };
        Update: {
          capacity_per_slot?: number;
          created_at?: string;
          daily_runs?: number;
          min_order_amount?: number;
          policy_id?: string;
          status?: string;
          store_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "store_quick_policy_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      store_quick_slot_usage: {
        Row: {
          depart_date: string;
          depart_time: string;
          reserved_count: number;
          store_id: string;
          usage_id: string;
        };
        Insert: {
          depart_date: string;
          depart_time: string;
          reserved_count?: number;
          store_id: string;
          usage_id?: string;
        };
        Update: {
          depart_date?: string;
          depart_time?: string;
          reserved_count?: number;
          store_id?: string;
          usage_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "store_quick_slot_usage_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      store_quick_time_slot: {
        Row: {
          created_at: string | null;
          day_type: string | null;
          depart_time: string;
          schedule_id: string;
          status: string;
          store_id: string;
        };
        Insert: {
          created_at?: string | null;
          day_type?: string | null;
          depart_time: string;
          schedule_id?: string;
          status?: string;
          store_id: string;
        };
        Update: {
          created_at?: string | null;
          day_type?: string | null;
          depart_time?: string;
          schedule_id?: string;
          status?: string;
          store_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "store_quick_time_slot_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      store_quick_timeslot: {
        Row: {
          created_at: string;
          depart_time: string;
          dow_mask: string | null;
          label: string;
          order_cutoff_min: number;
          slot_id: string;
          status: string;
          store_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          depart_time: string;
          dow_mask?: string | null;
          label: string;
          order_cutoff_min?: number;
          slot_id?: string;
          status?: string;
          store_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          depart_time?: string;
          dow_mask?: string | null;
          label?: string;
          order_cutoff_min?: number;
          slot_id?: string;
          status?: string;
          store_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "store_quick_timeslot_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      tenant: {
        Row: {
          code: string;
          created_at: string;
          name: string;
          status: string;
          tenant_id: string;
          type: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          name: string;
          status?: string;
          tenant_id?: string;
          type?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          name?: string;
          status?: string;
          tenant_id?: string;
          type?: string;
        };
        Relationships: [];
      };
      tenant_category_code: {
        Row: {
          code: string;
          created_at: string;
          description: string | null;
          icon_url: string | null;
          id: string;
          name: string;
          sort_order: number;
          status: string;
          tenant_id: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          description?: string | null;
          icon_url?: string | null;
          id?: string;
          name: string;
          sort_order?: number;
          status?: string;
          tenant_id: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          description?: string | null;
          icon_url?: string | null;
          id?: string;
          name?: string;
          sort_order?: number;
          status?: string;
          tenant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tenant_category_code_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenant";
            referencedColumns: ["tenant_id"];
          },
        ];
      };
      tenant_item_detail: {
        Row: {
          created_at: string;
          item_detail_id: string;
          item_detail_img_adv1: string | null;
          item_detail_img_adv2: string | null;
          item_detail_img_adv3: string | null;
          item_detail_img_label: string | null;
          item_img: string | null;
          item_thumbnail_big: string | null;
          item_thumbnail_small: string | null;
          short_description: string | null;
          status: string;
          tenant_item_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          item_detail_id?: string;
          item_detail_img_adv1?: string | null;
          item_detail_img_adv2?: string | null;
          item_detail_img_adv3?: string | null;
          item_detail_img_label?: string | null;
          item_img?: string | null;
          item_thumbnail_big?: string | null;
          item_thumbnail_small?: string | null;
          short_description?: string | null;
          status?: string;
          tenant_item_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          item_detail_id?: string;
          item_detail_img_adv1?: string | null;
          item_detail_img_adv2?: string | null;
          item_detail_img_adv3?: string | null;
          item_detail_img_label?: string | null;
          item_img?: string | null;
          item_thumbnail_big?: string | null;
          item_thumbnail_small?: string | null;
          short_description?: string | null;
          status?: string;
          tenant_item_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tenant_item_detail_tenant_item_id_fkey";
            columns: ["tenant_item_id"];
            isOneToOne: false;
            referencedRelation: "tenant_item_master";
            referencedColumns: ["tenant_item_id"];
          },
          {
            foreignKeyName: "tenant_item_detail_tenant_item_id_fkey";
            columns: ["tenant_item_id"];
            isOneToOne: false;
            referencedRelation: "v_store_inventory_item";
            referencedColumns: ["tenant_item_id"];
          },
          {
            foreignKeyName: "tenant_item_detail_tenant_item_id_fkey";
            columns: ["tenant_item_id"];
            isOneToOne: false;
            referencedRelation: "v_store_item";
            referencedColumns: ["tenant_item_id"];
          },
        ];
      };
      tenant_item_master: {
        Row: {
          category_code: string | null;
          category_name: string | null;
          consumer_price: number | null;
          created_at: string;
          default_list_price: number;
          default_sale_price: number;
          item_code: string;
          item_name: string;
          ranking: number;
          ranking_yn: string;
          sale_code: string;
          status: string;
          std_large_code: string | null;
          std_large_name: string | null;
          std_medium_code: string | null;
          std_medium_name: string | null;
          std_small_code: string | null;
          std_small_name: string | null;
          supplier: string | null;
          tenant_id: string;
          tenant_item_id: string;
          updated_at: string;
        };
        Insert: {
          category_code?: string | null;
          category_name?: string | null;
          consumer_price?: number | null;
          created_at?: string;
          default_list_price?: number;
          default_sale_price?: number;
          item_code: string;
          item_name: string;
          ranking?: number;
          ranking_yn?: string;
          sale_code: string;
          status?: string;
          std_large_code?: string | null;
          std_large_name?: string | null;
          std_medium_code?: string | null;
          std_medium_name?: string | null;
          std_small_code?: string | null;
          std_small_name?: string | null;
          supplier?: string | null;
          tenant_id: string;
          tenant_item_id?: string;
          updated_at?: string;
        };
        Update: {
          category_code?: string | null;
          category_name?: string | null;
          consumer_price?: number | null;
          created_at?: string;
          default_list_price?: number;
          default_sale_price?: number;
          item_code?: string;
          item_name?: string;
          ranking?: number;
          ranking_yn?: string;
          sale_code?: string;
          status?: string;
          std_large_code?: string | null;
          std_large_name?: string | null;
          std_medium_code?: string | null;
          std_medium_name?: string | null;
          std_small_code?: string | null;
          std_small_name?: string | null;
          supplier?: string | null;
          tenant_id?: string;
          tenant_item_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tenant_item_master_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenant";
            referencedColumns: ["tenant_id"];
          },
        ];
      };
      tenant_std_large_code: {
        Row: {
          code: string;
          created_at: string;
          icon_url: string | null;
          id: string;
          name: string;
          sort_order: number;
          status: string;
          tenant_id: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          icon_url?: string | null;
          id?: string;
          name: string;
          sort_order?: number;
          status?: string;
          tenant_id: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          icon_url?: string | null;
          id?: string;
          name?: string;
          sort_order?: number;
          status?: string;
          tenant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tenant_std_large_code_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenant";
            referencedColumns: ["tenant_id"];
          },
        ];
      };
      tenant_std_medium_code: {
        Row: {
          code: string;
          created_at: string;
          icon_url: string | null;
          id: string;
          large_id: string | null;
          name: string;
          sort_order: number;
          status: string;
          tenant_id: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          icon_url?: string | null;
          id?: string;
          large_id?: string | null;
          name: string;
          sort_order?: number;
          status?: string;
          tenant_id: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          icon_url?: string | null;
          id?: string;
          large_id?: string | null;
          name?: string;
          sort_order?: number;
          status?: string;
          tenant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tenant_std_medium_code_large_id_fkey";
            columns: ["large_id"];
            isOneToOne: false;
            referencedRelation: "tenant_std_large_code";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tenant_std_medium_code_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenant";
            referencedColumns: ["tenant_id"];
          },
        ];
      };
      tenant_std_small_code: {
        Row: {
          code: string;
          created_at: string;
          id: string;
          medium_id: string | null;
          name: string;
          sort_order: number;
          status: string;
          tenant_id: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          id?: string;
          medium_id?: string | null;
          name: string;
          sort_order?: number;
          status?: string;
          tenant_id: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          id?: string;
          medium_id?: string | null;
          name?: string;
          sort_order?: number;
          status?: string;
          tenant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tenant_std_small_code_medium_id_fkey";
            columns: ["medium_id"];
            isOneToOne: false;
            referencedRelation: "tenant_std_medium_code";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tenant_std_small_code_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenant";
            referencedColumns: ["tenant_id"];
          },
        ];
      };
      tenant_user: {
        Row: {
          auth_id: string;
          created_at: string;
          email: string;
          id: number;
          must_change_password: boolean;
          name: string;
          phone: string | null;
          role: string;
          status: string;
          tenant_code: string | null;
          updated_at: string;
        };
        Insert: {
          auth_id: string;
          created_at?: string;
          email: string;
          id?: number;
          must_change_password?: boolean;
          name: string;
          phone?: string | null;
          role: string;
          status?: string;
          tenant_code?: string | null;
          updated_at?: string;
        };
        Update: {
          auth_id?: string;
          created_at?: string;
          email?: string;
          id?: number;
          must_change_password?: boolean;
          name?: string;
          phone?: string | null;
          role?: string;
          status?: string;
          tenant_code?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_login_log: {
        Row: {
          created_at: string;
          fail_reason: string | null;
          log_id: string;
          login_ip: string | null;
          success: boolean;
          tenant_user_id: number | null;
          user_agent: string | null;
          user_id: string | null;
          user_role: string | null;
        };
        Insert: {
          created_at?: string;
          fail_reason?: string | null;
          log_id?: string;
          login_ip?: string | null;
          success?: boolean;
          tenant_user_id?: number | null;
          user_agent?: string | null;
          user_id?: string | null;
          user_role?: string | null;
        };
        Update: {
          created_at?: string;
          fail_reason?: string | null;
          log_id?: string;
          login_ip?: string | null;
          success?: boolean;
          tenant_user_id?: number | null;
          user_agent?: string | null;
          user_id?: string | null;
          user_role?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_login_log_tenant_user_id_fkey";
            columns: ["tenant_user_id"];
            isOneToOne: false;
            referencedRelation: "tenant_user";
            referencedColumns: ["id"];
          },
        ];
      };
      user_system_role: {
        Row: {
          auth_id: string;
          id: number;
          registered_at: string;
          system_code: string;
        };
        Insert: {
          auth_id: string;
          id?: number;
          registered_at?: string;
          system_code: string;
        };
        Update: {
          auth_id?: string;
          id?: number;
          registered_at?: string;
          system_code?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          active: boolean;
          auth_user_id: string | null;
          created_at: string;
          email: string;
          name: string;
          password_hash: string | null;
          phone: string | null;
          role: string;
          tenant_id: string | null;
          user_id: string;
        };
        Insert: {
          active?: boolean;
          auth_user_id?: string | null;
          created_at?: string;
          email: string;
          name: string;
          password_hash?: string | null;
          phone?: string | null;
          role: string;
          tenant_id?: string | null;
          user_id?: string;
        };
        Update: {
          active?: boolean;
          auth_user_id?: string | null;
          created_at?: string;
          email?: string;
          name?: string;
          password_hash?: string | null;
          phone?: string | null;
          role?: string;
          tenant_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "users_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenant";
            referencedColumns: ["tenant_id"];
          },
        ];
      };
      wishlist: {
        Row: {
          created_at: string;
          customer_id: string;
          modified_at: string;
          quantity: number;
          status: string;
          store_id: string;
          store_item_id: string;
        };
        Insert: {
          created_at?: string;
          customer_id: string;
          modified_at?: string;
          quantity?: number;
          status?: string;
          store_id: string;
          store_item_id: string;
        };
        Update: {
          created_at?: string;
          customer_id?: string;
          modified_at?: string;
          quantity?: number;
          status?: string;
          store_id?: string;
          store_item_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wishlist_store_item_id_fkey";
            columns: ["store_item_id"];
            isOneToOne: false;
            referencedRelation: "store_item";
            referencedColumns: ["store_item_id"];
          },
          {
            foreignKeyName: "wishlist_store_item_id_fkey";
            columns: ["store_item_id"];
            isOneToOne: false;
            referencedRelation: "v_store_inventory_item";
            referencedColumns: ["store_item_id"];
          },
          {
            foreignKeyName: "wishlist_store_item_id_fkey";
            columns: ["store_item_id"];
            isOneToOne: false;
            referencedRelation: "v_store_item";
            referencedColumns: ["store_item_id"];
          },
        ];
      };
      withdrawal_request: {
        Row: {
          account_no: string;
          amount: number;
          bank_name: string;
          processed_at: string | null;
          request_id: string;
          requested_at: string;
          rider_id: string;
          status: Database["public"]["Enums"]["payment_log_status"];
        };
        Insert: {
          account_no: string;
          amount: number;
          bank_name: string;
          processed_at?: string | null;
          request_id?: string;
          requested_at?: string;
          rider_id: string;
          status?: Database["public"]["Enums"]["payment_log_status"];
        };
        Update: {
          account_no?: string;
          amount?: number;
          bank_name?: string;
          processed_at?: string | null;
          request_id?: string;
          requested_at?: string;
          rider_id?: string;
          status?: Database["public"]["Enums"]["payment_log_status"];
        };
        Relationships: [
          {
            foreignKeyName: "withdrawal_request_rider_id_fkey";
            columns: ["rider_id"];
            isOneToOne: false;
            referencedRelation: "rider";
            referencedColumns: ["rider_id"];
          },
        ];
      };
    };
    Views: {
      v_store_inventory_item: {
        Row: {
          available_quantity: number | null;
          category_code: string | null;
          category_name: string | null;
          consumer_price: number | null;
          created_at: string | null;
          default_list_price: number | null;
          default_sale_price: number | null;
          is_in_stock: boolean | null;
          item_code: string | null;
          item_detail_id: string | null;
          item_detail_img_adv1: string | null;
          item_detail_img_adv2: string | null;
          item_detail_img_adv3: string | null;
          item_detail_img_label: string | null;
          item_img: string | null;
          item_name: string | null;
          item_thumbnail_big: string | null;
          item_thumbnail_small: string | null;
          list_price: number | null;
          on_hand: number | null;
          ranking: number | null;
          ranking_yn: string | null;
          reserved: number | null;
          safety_stock: number | null;
          sale_code: string | null;
          sale_price: number | null;
          short_description: string | null;
          status: string | null;
          std_large_code: string | null;
          std_large_name: string | null;
          std_medium_code: string | null;
          std_medium_name: string | null;
          std_small_code: string | null;
          std_small_name: string | null;
          store_id: string | null;
          store_item_id: string | null;
          supplier: string | null;
          tenant_id: string | null;
          tenant_item_id: string | null;
          updated_at: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "store_item_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
          {
            foreignKeyName: "tenant_item_master_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenant";
            referencedColumns: ["tenant_id"];
          },
        ];
      };
      v_store_item: {
        Row: {
          category_code: string | null;
          category_name: string | null;
          consumer_price: number | null;
          created_at: string | null;
          default_list_price: number | null;
          default_sale_price: number | null;
          item_code: string | null;
          item_detail_id: string | null;
          item_detail_img_adv1: string | null;
          item_detail_img_adv2: string | null;
          item_detail_img_adv3: string | null;
          item_detail_img_label: string | null;
          item_img: string | null;
          item_name: string | null;
          item_thumbnail_big: string | null;
          item_thumbnail_small: string | null;
          list_price: number | null;
          ranking: number | null;
          ranking_yn: string | null;
          sale_code: string | null;
          sale_price: number | null;
          short_description: string | null;
          status: string | null;
          std_large_code: string | null;
          std_large_name: string | null;
          std_medium_code: string | null;
          std_medium_name: string | null;
          std_small_code: string | null;
          std_small_name: string | null;
          store_id: string | null;
          store_item_id: string | null;
          supplier: string | null;
          tenant_id: string | null;
          tenant_item_id: string | null;
          updated_at: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "store_item_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
          {
            foreignKeyName: "tenant_item_master_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenant";
            referencedColumns: ["tenant_id"];
          },
        ];
      };
    };
    Functions: {
      fn_haversine_m: {
        Args: { lat1: number; lat2: number; lng1: number; lng2: number };
        Returns: number;
      };
      fn_operations_kpi: {
        Args: {
          p_end_date: string;
          p_start_date: string;
          p_store_id?: string;
          p_tenant_id?: string;
        };
        Returns: {
          avg_rating: number;
          customer_cnt: number;
          order_cnt: number;
          review_cnt: number;
          store_id: string;
          store_name: string;
          total_revenue: number;
        }[];
      };
      fn_operations_trend: {
        Args: { p_end_date: string; p_start_date: string; p_store_id: string };
        Returns: {
          customer_cnt: number;
          order_cnt: number;
          period_date: string;
          revenue: number;
          review_cnt: number;
        }[];
      };
      fn_sales_summary: {
        Args: {
          p_end_date: string;
          p_period_type: string;
          p_start_date: string;
          p_store_id?: string;
          p_tenant_id?: string;
        };
        Returns: {
          ceo_name: string;
          fee_amount: number;
          fee_rate: number;
          order_amount: number;
          order_count: number;
          period_label: string;
          reg_number: string;
          shipping_fee: number;
          store_id: string;
          store_name: string;
          total_amount: number;
          vat_amount: number;
        }[];
      };
      fn_stores_within_delivery: {
        Args: { p_customer_id: string };
        Returns: {
          address: string;
          delivery_radius_m: number;
          distance_m: number;
          in_range: boolean;
          lat: number;
          lng: number;
          name: string;
          store_id: string;
        }[];
      };
      fn_stores_within_rider_radius: {
        Args: { p_lat: number; p_lng: number; p_max_m?: number };
        Returns: {
          address: string;
          distance_m: number;
          name: string;
          store_id: string;
        }[];
      };
      fn_v07d_application_stats: {
        Args: { p_from: string; p_to: string };
        Returns: {
          cnt: number;
          status: string;
        }[];
      };
      fn_v07d_geocode_call_trend: {
        Args: { p_from: string; p_to: string };
        Returns: {
          cnt: number;
          day: string;
          status: string;
        }[];
      };
      fn_v07d_geocoding_progress: {
        Args: never;
        Returns: {
          entity: string;
          geocoded: number;
          pct: number;
          total: number;
        }[];
      };
      fn_v07d_out_of_range_customers: { Args: never; Returns: number };
      fn_v07d_rejection_stats: {
        Args: { p_from: string; p_to: string };
        Returns: {
          refund_completed: number;
          refund_failed: number;
          reject_count: number;
          store_id: string;
          store_name: string;
        }[];
      };
      get_my_rider_id: { Args: never; Returns: string };
      is_admin: { Args: never; Returns: boolean };
      search_items_by_store: {
        Args: {
          p_keyword: string;
          p_limit?: number;
          p_store_id: string;
          p_threshold?: number;
        };
        Returns: {
          available_quantity: number | null;
          category_code: string | null;
          category_name: string | null;
          consumer_price: number | null;
          created_at: string | null;
          default_list_price: number | null;
          default_sale_price: number | null;
          is_in_stock: boolean | null;
          item_code: string | null;
          item_detail_id: string | null;
          item_detail_img_adv1: string | null;
          item_detail_img_adv2: string | null;
          item_detail_img_adv3: string | null;
          item_detail_img_label: string | null;
          item_img: string | null;
          item_name: string | null;
          item_thumbnail_big: string | null;
          item_thumbnail_small: string | null;
          list_price: number | null;
          on_hand: number | null;
          ranking: number | null;
          ranking_yn: string | null;
          reserved: number | null;
          safety_stock: number | null;
          sale_code: string | null;
          sale_price: number | null;
          short_description: string | null;
          status: string | null;
          std_large_code: string | null;
          std_large_name: string | null;
          std_medium_code: string | null;
          std_medium_name: string | null;
          std_small_code: string | null;
          std_small_name: string | null;
          store_id: string | null;
          store_item_id: string | null;
          supplier: string | null;
          tenant_id: string | null;
          tenant_item_id: string | null;
          updated_at: string | null;
        }[];
        SetofOptions: {
          from: "*";
          to: "v_store_inventory_item";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { "": string }; Returns: string[] };
    };
    Enums: {
      assignment_status:
        | "PENDING"
        | "ACCEPTED"
        | "PICKED_UP"
        | "OUT"
        | "DELIVERED"
        | "FAILED"
        | "RETURNED";
      incident_resolution: "OPEN" | "RESOLVED" | "REASSIGNED";
      incident_type: "ABSENT" | "DAMAGE" | "TRAFFIC" | "DELAY" | "REASSIGN";
      payment_log_status: "PENDING" | "PAID" | "FAILED";
      proof_type: "PHOTO" | "SIGN" | "OTP";
      rider_status: "ACTIVE" | "OFFLINE" | "BLOCKED";
      route_point_type: "PICKUP" | "STORE" | "DROP";
      shipment_event_code_enum: "ASSIGNED" | "OUT" | "ARRIVED" | "FAILED";
      shipment_status_enum: "READY" | "ASSIGNED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "FAILED";
      vehicle_type: "BIKE" | "MOTO" | "CAR";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      assignment_status: [
        "PENDING",
        "ACCEPTED",
        "PICKED_UP",
        "OUT",
        "DELIVERED",
        "FAILED",
        "RETURNED",
      ],
      incident_resolution: ["OPEN", "RESOLVED", "REASSIGNED"],
      incident_type: ["ABSENT", "DAMAGE", "TRAFFIC", "DELAY", "REASSIGN"],
      payment_log_status: ["PENDING", "PAID", "FAILED"],
      proof_type: ["PHOTO", "SIGN", "OTP"],
      rider_status: ["ACTIVE", "OFFLINE", "BLOCKED"],
      route_point_type: ["PICKUP", "STORE", "DROP"],
      shipment_event_code_enum: ["ASSIGNED", "OUT", "ARRIVED", "FAILED"],
      shipment_status_enum: ["READY", "ASSIGNED", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED"],
      vehicle_type: ["BIKE", "MOTO", "CAR"],
    },
  },
} as const;
