-- 여행(Trips) 테이블
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  companions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 일정(Schedules) 테이블
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  place_name TEXT NOT NULL,
  address TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  memo TEXT,
  details JSONB DEFAULT '{}',
  order_idx INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기록(Logs) 테이블
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
  media_type TEXT CHECK (media_type IN ('photo', 'video')),
  media_url TEXT NOT NULL,
  content TEXT,
  rating INTEGER,
  shopping_list JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS(Row Level Security) 설정
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 데이터만 조회/수정 가능하도록 정책 추가
CREATE POLICY "Users can view their own trips" ON trips FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own trips" ON trips FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own trips" ON trips FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own trips" ON trips FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view schedules of their trips" ON schedules FOR SELECT USING (
  EXISTS (SELECT 1 FROM trips WHERE trips.id = schedules.trip_id AND trips.user_id = auth.uid())
);
CREATE POLICY "Users can insert schedules into their trips" ON schedules FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM trips WHERE trips.id = trip_id AND trips.user_id = auth.uid())
);
CREATE POLICY "Users can update schedules of their trips" ON schedules FOR UPDATE USING (
  EXISTS (SELECT 1 FROM trips WHERE trips.id = schedules.trip_id AND trips.user_id = auth.uid())
);
CREATE POLICY "Users can delete schedules of their trips" ON schedules FOR DELETE USING (
  EXISTS (SELECT 1 FROM trips WHERE trips.id = schedules.trip_id AND trips.user_id = auth.uid())
);

CREATE POLICY "Users can view logs of their trips" ON logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM trips WHERE trips.id = logs.trip_id AND trips.user_id = auth.uid())
);
CREATE POLICY "Users can insert logs into their trips" ON logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM trips WHERE trips.id = trip_id AND trips.user_id = auth.uid())
);
CREATE POLICY "Users can update logs of their trips" ON logs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM trips WHERE trips.id = logs.trip_id AND trips.user_id = auth.uid())
);
CREATE POLICY "Users can delete logs of their trips" ON logs FOR DELETE USING (
  EXISTS (SELECT 1 FROM trips WHERE trips.id = logs.trip_id AND trips.user_id = auth.uid())
);
