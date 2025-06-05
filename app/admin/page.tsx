"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { Field } from "@/types/field";
import { Booking } from "@/types/booking";
import { User } from "@/types/user";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [fields, setFields] = useState<Field[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user?.isAdmin) {
      router.push("/");
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel",
        variant: "destructive",
      });
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [fieldsRes, bookingsRes, usersRes] = await Promise.all([
          fetch('/api/fields'),
          fetch('/api/bookings'),
          fetch('/api/users')
        ]);

        const [fieldsData, bookingsData, usersData] = await Promise.all([
          fieldsRes.json(),
          bookingsRes.json(),
          usersRes.json()
        ]);

        setFields(fieldsData);
        setBookings(bookingsData);
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router, toast]);

  // Filter fields based on search query
  const filteredFields = fields.filter(field => 
    field.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    field.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter bookings based on search query
  const filteredBookings = bookings.filter(booking => 
    booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.fieldId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFieldName = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    return field ? field.name : "Unknown Field";
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : "Unknown User";
  };

  const handleAddField = async (formData: FormData) => {
    const fieldData = {
      name: formData.get('name'),
      location: formData.get('location'),
      pricePerHour: parseInt(formData.get('price') as string),
      size: formData.get('size'),
      description: "New field",
      imageUrl: "https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg",
      amenities: ["Phòng thay đồ", "Đèn chiếu sáng"],
      isAvailable: true
    };

    try {
      const response = await fetch('/api/fields', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fieldData),
      });

      if (!response.ok) throw new Error('Failed to add field');

      const newField = await response.json();
      setFields([...fields, newField]);
      toast({
        title: "Success",
        description: "Field added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add field",
        variant: "destructive",
      });
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    try {
      const response = await fetch(`/api/fields/${fieldId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete field');

      setFields(fields.filter(f => f.id !== fieldId));
      toast({
        title: "Success",
        description: "Field deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete field",
        variant: "destructive",
      });
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update booking status');

      const updatedBooking = await response.json();
      setBookings(bookings.map(b => b.id === bookingId ? updatedBooking : b));
      toast({
        title: "Success",
        description: "Booking status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete user');

      setUsers(users.filter(u => u.id !== userId));
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 w-1/4 bg-slate-200 rounded mb-6"></div>
            <div className="h-10 w-1/3 bg-slate-200 rounded mb-8"></div>
            <div className="h-40 bg-slate-200 rounded mb-4"></div>
            <div className="h-40 bg-slate-200 rounded mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2">Trang quản lý sân bóng</h1>
        <p className="text-muted-foreground mb-8">
          Quản lý sân bóng, lịch đặt và người dùng
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tổng số sân</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{fields.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tổng số lịch đặt</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{bookings.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Người dùng đã đăng ký</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{users.length}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Tìm kiếm..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="fields" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="fields">Sân bóng</TabsTrigger>
            <TabsTrigger value="bookings">Lịch đặt</TabsTrigger>
            <TabsTrigger value="users">Người dùng</TabsTrigger>
          </TabsList>
          
          <TabsContent value="fields">
            <div className="flex justify-end mb-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" /> Thêm sân
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Thêm sân mới</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleAddField(new FormData(e.target as HTMLFormElement));
                  }}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Tên</Label>
                        <Input id="name" name="name" className="col-span-3" required />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="location" className="text-right">Địa điểm</Label>
                        <Input id="location" name="location" className="col-span-3" required />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">Giá/giờ</Label>
                        <Input id="price" name="price" type="number" className="col-span-3" required />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="size" className="text-right">Kích cỡ sân</Label>
                        <Input id="size" name="size" className="col-span-3" placeholder="e.g. Sân 5 người" required />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit">Lưu sân</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên sân</TableHead>
                    <TableHead>Địa điểm</TableHead>
                    <TableHead>Giá/giờ</TableHead>
                    <TableHead>Kích cỡ</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFields.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                        Không tìm thấy sân
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFields.map((field) => (
                      <TableRow key={field.id}>
                        <TableCell className="font-medium">{field.name}</TableCell>
                        <TableCell>{field.location}</TableCell>
                        <TableCell>{field.pricePerHour.toLocaleString("vi-VN")}₫</TableCell>
                        <TableCell>{field.size}</TableCell>
                        <TableCell>
                          <Badge 
                            className={field.isAvailable ? "bg-green-300 text-green-800" : "bg-red-400 text-red-800"}
                            variant="outline"
                          >
                            {field.isAvailable ? "Trống" : "Đã đặt"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Mở menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Sửa</DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDeleteField(field.id)}
                              >
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="bookings">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Lịch đặt</TableHead>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Sân bóng</TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Giờ</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                        Không tìm thấy lịch đặt
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.id}</TableCell>
                        <TableCell>{getUserName(booking.userId)}</TableCell>
                        <TableCell>{getFieldName(booking.fieldId)}</TableCell>
                        <TableCell>{booking.date}</TableCell>
                        <TableCell>{booking.startTime} - {booking.endTime}</TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              booking.status === "Đã xác nhận" ? "bg-green-200 text-green-800" : 
                              booking.status === "Chưa xác nhận" ? "bg-amber-200 text-amber-800" : 
                              "bg-red-100 text-red-800"
                            }
                            variant="outline"
                          >
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Mở menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleUpdateBookingStatus(booking.id, "Đã xác nhận")}>
                                Xác nhận
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleUpdateBookingStatus(booking.id, "Đã hủy")}
                              >
                                Hủy
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="users">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        Không tìm thấy người dùng
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge 
                            className={user.isAdmin ? "bg-blue-300 text-blue-900" : "bg-pink-100 text-pink-900"}
                            variant="outline"
                          >
                            {user.isAdmin ? "Admin" : "User"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Mở menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Sửa</DropdownMenuItem>
                              {!user.isAdmin && (
                                <DropdownMenuItem>Đặt làm quản trị viên</DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}